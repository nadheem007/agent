import sys
import os
import logging
import time
from typing import Optional, List, Dict, Any
from uuid import uuid4

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from agents import (
    Runner,
    ItemHelpers,
    MessageOutputItem,
    HandoffOutputItem,
    ToolCallItem,
    ToolCallOutputItem,
    InputGuardrailTripwireTriggered,
    Handoff,
    RunContextWrapper,
    set_tracing_disabled,
    enable_verbose_stdout_logging
)

enable_verbose_stdout_logging()
set_tracing_disabled(True)

from main import (
    triage_agent,
    seat_booking_agent,
    flight_status_agent,
    cancellation_agent,
    faq_agent,
    schedule_agent,
    networking_agent,
    create_initial_context,
    load_customer_context,
    load_user_context,
    AirlineAgentContext,
)

from database import db_client

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    conversation_id: Optional[str] = None
    message: str
    registration_id: Optional[str] = None

class MessageResponse(BaseModel):
    content: str
    agent: str

class AgentEvent(BaseModel):
    id: str
    type: str
    agent: str
    content: str
    metadata: Optional[Dict[str, Any]] = None
    timestamp: Optional[float] = None

class GuardrailCheck(BaseModel):
    id: str
    name: str
    input: str
    reasoning: str
    passed: bool
    timestamp: float

class CustomerDetails(BaseModel):
    name: Optional[str] = None
    account_number: Optional[str] = None
    email: Optional[str] = None
    is_conference_attendee: Optional[bool] = None
    conference_name: Optional[str] = None
    registration_id: Optional[str] = None

class BookingDetails(BaseModel):
    id: str
    confirmation_number: str

class CustomerInfoResponse(BaseModel):
    customer: Optional[CustomerDetails] = None
    bookings: List[BookingDetails] = []
    current_booking: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    conversation_id: str
    current_agent: str
    messages: List[MessageResponse]
    events: List[AgentEvent]
    context: Dict[str, Any]
    agents: List[Dict[str, Any]]
    guardrails: List[GuardrailCheck] = []
    customer_info: Optional[CustomerInfoResponse] = None

class ConversationStore:
    async def get(self, conversation_id: str) -> Optional[Dict[str, Any]]:
        raise NotImplementedError

    async def save(self, conversation_id: str, state: Dict[str, Any]):
        raise NotImplementedError

class SupabaseConversationStore(ConversationStore):
    def __init__(self):
        self._memory_cache: Dict[str, Dict[str, Any]] = {}

    async def get(self, conversation_id: str) -> Optional[Dict[str, Any]]:
        if conversation_id in self._memory_cache:
            logger.debug(f"Loaded conversation {conversation_id} from memory cache.")
            return self._memory_cache[conversation_id]
        
        try:
            conversation_data = await db_client.load_conversation(conversation_id)
            if conversation_data:
                context_data = conversation_data.get("context", {})
                if isinstance(context_data, dict):
                    context_instance = AirlineAgentContext(**context_data)
                else:
                    context_instance = create_initial_context()

                state = {
                    "input_items": conversation_data.get("history", []),
                    "context": context_instance,
                    "current_agent": conversation_data.get("current_agent", triage_agent.name),
                }
                self._memory_cache[conversation_id] = state
                logger.debug(f"Loaded conversation {conversation_id} from database.")
                return state
        except Exception as e:
            logger.error(f"Error loading conversation {conversation_id} from database: {e}", exc_info=True)
        
        return None

    async def save(self, conversation_id: str, state: Dict[str, Any]):
        self._memory_cache[conversation_id] = state
        try:
            context_to_save = state["context"].model_dump() if isinstance(state["context"], BaseModel) else state["context"]
            success = await db_client.save_conversation(
                session_id=conversation_id,
                history=state.get("input_items", []),
                context=context_to_save,
                current_agent=state.get("current_agent", triage_agent.name)
            )
            if not success:
                logger.warning(f"Failed to save conversation {conversation_id} to database.")
            else:
                logger.debug(f"Saved conversation {conversation_id} to database.")
        except Exception as e:
            logger.error(f"Error saving conversation {conversation_id} to database: {e}", exc_info=True)

conversation_store = SupabaseConversationStore()

def get_agent_by_name(name: str):
    agents = {
        triage_agent.name: triage_agent,
        seat_booking_agent.name: seat_booking_agent,
        flight_status_agent.name: flight_status_agent,
        cancellation_agent.name: cancellation_agent,
        faq_agent.name: faq_agent,
        schedule_agent.name: schedule_agent,
        networking_agent.name: networking_agent,
    }
    return agents.get(name, triage_agent)

def get_guardrail_name(g) -> str:
    name_attr = getattr(g, "name", None)
    if isinstance(name_attr, str) and name_attr:
        return name_attr
    guard_fn = getattr(g, "guardrail_function", None)
    if guard_fn is not None and hasattr(guard_fn, "__name__"):
        return guard_fn.__name__.replace("_", " ").title()
    fn_name = getattr(g, "__name__", None)
    if isinstance(fn_name, str) and fn_name:
        return fn_name.replace("_", " ").title()
    return str(g)

def build_agents_list() -> List[Dict[str, Any]]:
    all_agents = [
        triage_agent,
        seat_booking_agent,
        flight_status_agent,
        cancellation_agent,
        faq_agent,
        schedule_agent,
        networking_agent,
    ]
    def make_agent_dict(agent):
        handoff_names = []
        for h in getattr(agent, "handoffs", []):
            if hasattr(h, 'agent') and hasattr(h.agent, 'name'):
                handoff_names.append(h.agent.name)
            elif hasattr(h, 'agent_name'):
                handoff_names.append(h.agent_name)
            else:
                handoff_names.append(str(h))
        tool_names = [getattr(t, "name_override", getattr(t, "__name__", str(t))) for t in getattr(agent, "tools", [])]
        input_guardrail_names = [get_guardrail_name(g) for g in getattr(agent, "input_guardrails", [])]
        return {
            "name": agent.name,
            "description": getattr(agent, "handoff_description", getattr(agent, "description", "")),
            "handoffs": handoff_names,
            "tools": tool_names,
            "input_guardrails": input_guardrail_names,
        }
    return [make_agent_dict(agent) for agent in all_agents]

@app.get("/user/{registration_id}", response_model=Dict[str, Any])
async def get_user(registration_id: str):
    try:
        user = await db_client.get_user_by_registration_id(registration_id)
        if not user:
            logger.debug(f"No user found for registration_id: {registration_id}")
            raise HTTPException(status_code=404, detail=f"User with registration_id {registration_id} not found")
        logger.debug(f"Returning user data for {registration_id}: {user}")
        return user
    except Exception as e:
        logger.error(f"Error fetching user {registration_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest):
    conversation_id: str = req.conversation_id or uuid4().hex
    current_agent_name: str = triage_agent.name
    state: Dict[str, Any] = {
        "input_items": [],
        "context": create_initial_context(),
        "current_agent": triage_agent.name,
    }
    
    try:
        logger.debug(f"Received request for conversation_id: {req.conversation_id}, message: '{req.message}'")
        
        existing_state = await conversation_store.get(req.conversation_id) if req.conversation_id else None
        
        if existing_state:
            state = existing_state
            conversation_id = req.conversation_id
            logger.debug(f"Resuming existing conversation {conversation_id} with agent {state['current_agent']}")
        else:
            conversation_id = uuid4().hex
            
            if req.registration_id:
                state["context"] = await load_user_context(req.registration_id)
                logger.info(f"New conversation {conversation_id}. Loaded user context for registration_id: {req.registration_id}")
            else:
                state["context"] = create_initial_context()
                logger.info(f"New conversation {conversation_id}. Created initial context.")
            
            customer_info_response = None
            if state["context"].registration_id:
                customer_info_response = CustomerInfoResponse(
                    customer=CustomerDetails(
                        name=state["context"].passenger_name,
                        account_number=state["context"].account_number,
                        email=state["context"].customer_email,
                        is_conference_attendee=state["context"].is_conference_attendee,
                        conference_name=state["context"].conference_name,
                        registration_id=state["context"].registration_id,
                    ),
                    bookings=[BookingDetails(**b) for b in state["context"].customer_bookings] if state["context"].customer_bookings else []
                )

            if not req.message.strip():
                await conversation_store.save(conversation_id, state)
                return ChatResponse(
                    conversation_id=conversation_id,
                    current_agent=state["current_agent"],
                    messages=[],
                    events=[AgentEvent(id=uuid4().hex, type="info", agent="System", content="Conversation started.")],
                    context=state["context"].model_dump(),
                    agents=build_agents_list(),
                    guardrails=[],
                    customer_info=customer_info_response,
                )

        current_agent = get_agent_by_name(state["current_agent"])
        current_agent_name = current_agent.name
        
        state["input_items"].append({"content": req.message, "role": "user"})
        
        old_context_dict = state["context"].model_dump().copy()
        messages: List[MessageResponse] = []
        events: List[AgentEvent] = []

        logger.debug(f"Running agent: {current_agent.name}, with input: '{req.message}'")
        
        result = await Runner.run(
            current_agent,
            state["input_items"],
            context=state["context"] 
        )

        for item in result.new_items:
            current_time_ms = time.time() * 1000
            if isinstance(item, MessageOutputItem):
                text = ItemHelpers.text_message_output(item)
                messages.append(MessageResponse(content=text, agent=item.agent.name))
                events.append(AgentEvent(id=uuid4().hex, type="message", agent=item.agent.name, content=text, timestamp=current_time_ms))
            elif isinstance(item, HandoffOutputItem):
                events.append(
                    AgentEvent(
                        id=uuid4().hex,
                        type="handoff",
                        agent=item.source_agent.name,
                        content=f"Handoff from {item.source_agent.name} to {item.target_agent.name}",
                        metadata={"source_agent": item.source_agent.name, "target_agent": item.target_agent.name},
                        timestamp=current_time_ms
                    )
                )
                ho = next((h for h in getattr(item.source_agent, "handoffs", []) if getattr(h, "agent", None) == item.target_agent), None)
                if ho and ho.on_handoff:
                    cb_name = getattr(ho.on_handoff, "__name__", repr(ho.on_handoff))
                    events.append(AgentEvent(id=uuid4().hex, type="hook_call", agent=item.target_agent.name, content=f"Calling handoff hook: {cb_name}", timestamp=current_time_ms))
                    await ho.on_handoff(RunContextWrapper(context=state["context"]))
                    events.append(AgentEvent(id=uuid4().hex, type="hook_output", agent=item.target_agent.name, content=f"Handoff hook {cb_name} completed.", timestamp=current_time_ms))
                current_agent = item.target_agent
                state["current_agent"] = current_agent.name
            elif isinstance(item, ToolCallItem):
                tool_name = getattr(item.raw_item, "name", "")
                tool_args = getattr(item.raw_item, "arguments", {})
                events.append(
                    AgentEvent(
                        id=uuid4().hex,
                        type="tool_call",
                        agent=item.agent.name,
                        content=f"Calling tool: {tool_name}",
                        metadata={"tool_name": tool_name, "tool_args": tool_args},
                        timestamp=current_time_ms
                    )
                )
                if tool_name == "display_seat_map":
                    messages.append(MessageResponse(content="DISPLAY_SEAT_MAP", agent=item.agent.name))
                elif tool_name == "display_business_form":
                    messages.append(MessageResponse(content="DISPLAY_BUSINESS_FORM", agent=item.agent.name))
            elif isinstance(item, ToolCallOutputItem):
                tool_name_for_log = "UNKNOWN_TOOL"
                if hasattr(item, 'tool_call') and item.tool_call is not None and \
                   hasattr(item.tool_call, 'function') and item.tool_call.function is not None and \
                   hasattr(item.tool_call.function, 'name'):
                    tool_name_for_log = item.tool_call.function.name

                events.append(
                    AgentEvent(
                        id=uuid4().hex,
                        type="tool_output",
                        agent=item.agent.name,
                        content=f"Tool '{tool_name_for_log}' output: {str(item.output)}",
                        metadata={"tool_result": str(item.output), "tool_name": tool_name_for_log},
                        timestamp=current_time_ms
                    )
                )
        
        new_context_dict = state["context"].model_dump()
        changes = {k: new_context_dict[k] for k in new_context_dict if old_context_dict.get(k) != new_context_dict[k]}
        if changes:
            events.append(
                AgentEvent(
                    id=uuid4().hex,
                    type="context_update",
                    agent=current_agent.name,
                    content=f"Context updated: {', '.join(changes.keys())}",
                    metadata={"changes": changes},
                    timestamp=time.time() * 1000
                )
            )

        state["input_items"] = result.to_input_list()
        state["current_agent"] = current_agent.name

        logger.debug(f"Attempting to save conversation {conversation_id} state.")
        await conversation_store.save(conversation_id, state)
        logger.debug(f"Conversation {conversation_id} state successfully saved.")

        guardrail_checks: List[GuardrailCheck] = []
        active_agent_for_guardrails = get_agent_by_name(state["current_agent"])
        for g in getattr(active_agent_for_guardrails, "input_guardrails", []):
            guardrail_checks.append(
                GuardrailCheck(
                    id=uuid4().hex,
                    name=get_guardrail_name(g),
                    input=req.message,
                    reasoning="Passed (no tripwire triggered)",
                    passed=True,
                    timestamp=time.time() * 1000,
                )
            )
        
        customer_info_response = None
        if state["context"].registration_id:
            customer_info_response = CustomerInfoResponse(
                customer=CustomerDetails(
                    name=state["context"].passenger_name,
                    account_number=state["context"].account_number,
                    email=state["context"].customer_email,
                    is_conference_attendee=state["context"].is_conference_attendee,
                    conference_name=state["context"].conference_name,
                    registration_id=state["context"].registration_id,
                ),
                bookings=[BookingDetails(**b) for b in state["context"].customer_bookings] if state["context"].customer_bookings else []
            )

        logger.debug(f"Returning ChatResponse for conversation {conversation_id}.")
        return ChatResponse(
            conversation_id=conversation_id,
            current_agent=state["current_agent"],
            messages=messages,
            events=events,
            context=new_context_dict,
            agents=build_agents_list(),
            guardrails=guardrail_checks,
            customer_info=customer_info_response,
        )

    except InputGuardrailTripwireTriggered as e:
        logger.warning(f"Guardrail tripped for conversation {conversation_id}: {e.guardrail_result.guardrail.name}")
        failed_guardrail_name = get_guardrail_name(e.guardrail_result.guardrail)
        gr_input = req.message
        gr_timestamp = time.time() * 1000
        
        guardrail_checks = []
        for g in getattr(get_agent_by_name(current_agent_name), "input_guardrails", []):
            reasoning = ""
            passed = True
            if get_guardrail_name(g) == failed_guardrail_name:
                reasoning = getattr(e.guardrail_result, "reasoning", "Guardrail tripped.")
                if not reasoning:
                    reasoning = "Guardrail tripped."
                passed = False
            guardrail_checks.append(
                GuardrailCheck(
                    id=uuid4().hex,
                    name=get_guardrail_name(g),
                    input=gr_input,
                    reasoning=reasoning,
                    passed=passed,
                    timestamp=gr_timestamp,
                )
            )

        refusal = "I can only assist with airline travel services, conference information, and business networking. Your message was flagged as outside my area of expertise. Please ask about flights, bookings, seat changes, cancellations, conference schedules, or business connections."
        state["input_items"].append({"role": "assistant", "content": refusal})
        
        await conversation_store.save(conversation_id, state)

        customer_info_response = None
        if state["context"].registration_id:
            customer_info_response = CustomerInfoResponse(
                customer=CustomerDetails(
                    name=state["context"].passenger_name,
                    account_number=state["context"].account_number,
                    email=state["context"].customer_email,
                    is_conference_attendee=state["context"].is_conference_attendee,
                    conference_name=state["context"].conference_name,
                    registration_id=state["context"].registration_id,
                ),
                bookings=[BookingDetails(**b) for b in state["context"].customer_bookings] if state["context"].customer_bookings else []
            )

        return ChatResponse(
            conversation_id=conversation_id,
            current_agent=state["current_agent"],
            messages=[MessageResponse(content=refusal, agent=state["current_agent"])],
            events=[AgentEvent(id=uuid4().hex, type="guardrail_refusal", agent="System", content=refusal, metadata={"guardrail_name": failed_guardrail_name}, timestamp=gr_timestamp)],
            context=state["context"].model_dump(),
            agents=build_agents_list(),
            guardrails=guardrail_checks,
            customer_info=customer_info_response,
        )
    except Exception as e:
        logger.error(f"Unexpected error in chat_endpoint for conversation {conversation_id}: {str(e)}", exc_info=True)
        try:
            error_message_for_user = "An unexpected internal error occurred. Please try again or contact support."
            if not isinstance(state.get("input_items"), list):
                state["input_items"] = []
            state["input_items"].append({"role": "assistant", "content": error_message_for_user})
            await conversation_store.save(conversation_id, state)
        except Exception as save_e:
            logger.error(f"Failed to save state after unexpected error: {save_e}", exc_info=True)
            
        raise HTTPException(status_code=500, detail="Internal server error. Please try again later.")