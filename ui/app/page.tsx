// "use client";

// import { useEffect, useState } from "react";
// import { AgentPanel } from "../components/agent-panel";
// import { Chat } from "../components/Chat";
// import { CustomerLogin } from "../components/customer-login";
// import type { Agent, AgentEvent, GuardrailCheck, Message } from "@/lib/types";
// import { callChatAPI } from "../lib/api";

// export default function Home() {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [events, setEvents] = useState<AgentEvent[]>([]);
//   const [agents, setAgents] = useState<Agent[]>([]);
//   const [currentAgent, setCurrentAgent] = useState<string>("");
//   const [guardrails, setGuardrails] = useState<GuardrailCheck[]>([]);
//   const [context, setContext] = useState<Record<string, any>>({});
//   const [conversationId, setConversationId] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
  
//   // Customer authentication state
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [customerInfo, setCustomerInfo] = useState<any>(null);
//   const [accountNumber, setAccountNumber] = useState<string>("");

//   // Handle customer login
//   const handleLogin = async (accNumber: string, custInfo: any) => {
//     setAccountNumber(accNumber);
//     setCustomerInfo(custInfo);
//     setIsLoggedIn(true);

//     // Initialize conversation with customer context
//     const data = await callChatAPI("", "", accNumber);
    
//     if (data) {
//       setConversationId(data.conversation_id);
//       setCurrentAgent(data.current_agent);
//       setContext(data.context);
//       const initialEvents = (data.events || []).map((e: any) => ({
//         ...e,
//         timestamp: e.timestamp ?? Date.now(),
//       }));
//       setEvents(initialEvents);
//       setAgents(data.agents || []);
//       setGuardrails(data.guardrails || []);
      
//       if (Array.isArray(data.messages)) {
//         setMessages(
//           data.messages.map((m: any) => ({
//             id: Date.now().toString() + Math.random().toString(),
//             content: m.content,
//             role: "assistant",
//             agent: m.agent,
//             timestamp: new Date(),
//           }))
//         );
//       }

//       // Add welcome message with customer info
//       const welcomeMessage: Message = {
//         id: Date.now().toString(),
//         content: `Welcome back, ${custInfo.customer.name}! I can help you with your bookings, flight status, seat changes, and more. How can I assist you today?`,
//         role: "assistant",
//         agent: "Triage Agent",
//         timestamp: new Date(),
//       };
//       setMessages([welcomeMessage]);
//     }
//   };

//   // Send a user message
//   const handleSendMessage = async (content: string) => {
//     const userMsg: Message = {
//       id: Date.now().toString(),
//       content,
//       role: "user",
//       timestamp: new Date(),
//     };

//     setMessages((prev) => [...prev, userMsg]);
//     setIsLoading(true);

//     const data = await callChatAPI(content, conversationId ?? "", accountNumber);

//     if (!data) {
//       console.error("Chat API call returned no data for message:", content);
//       setMessages((prev) => [...prev, {
//         id: Date.now().toString(),
//         content: "I'm having trouble connecting right now. Please try again in a moment.",
//         role: "assistant",
//         agent: "System",
//         timestamp: new Date(),
//       }]);
//       setIsLoading(false);
//       return;
//     }

//     if (!conversationId) setConversationId(data.conversation_id || null);
//     setCurrentAgent(data.current_agent || "");
//     setContext(data.context || {});
    
//     if (data.events) {
//       const stamped = data.events.map((e: any) => ({
//         ...e,
//         timestamp: e.timestamp ?? Date.now(),
//       }));
//       setEvents((prev) => [...prev, ...stamped]);
//     }
//     if (data.agents) setAgents(data.agents);
//     if (data.guardrails) setGuardrails(data.guardrails);

//     if (data.messages) {
//       const responses: Message[] = data.messages.map((m: any) => ({
//         id: Date.now().toString() + Math.random().toString(),
//         content: m.content,
//         role: "assistant",
//         agent: m.agent,
//         timestamp: new Date(),
//       }));
//       setMessages((prev) => [...prev, ...responses]);
//     }

//     setIsLoading(false);
//   };

//   // Show login screen if not logged in
//   if (!isLoggedIn) {
//     return <CustomerLogin onLogin={handleLogin} />;
//   }

//   return (
//     <main className="flex h-screen gap-2 bg-gray-100 p-2">
//       <AgentPanel
//         agents={agents}
//         currentAgent={currentAgent}
//         events={events}
//         guardrails={guardrails}
//         context={context}
//         customerInfo={customerInfo}
//       />
//       <Chat
//         messages={messages}
//         onSendMessage={handleSendMessage}
//         isLoading={isLoading}
//         customerInfo={customerInfo}
//       />
//     </main>
//   );
// }














// "use client";

// import { useEffect, useState } from "react";
// import { AgentPanel } from "../components/agent-panel";
// import { Chat } from "../components/Chat";
// import { CustomerLogin } from "../components/customer-login";
// import type { Agent, AgentEvent, GuardrailCheck, Message } from "@/lib/types";
// import { callChatAPI } from "../lib/api";

// export default function Home() {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [events, setEvents] = useState<AgentEvent[]>([]);
//   const [agents, setAgents] = useState<Agent[]>([]);
//   const [currentAgent, setCurrentAgent] = useState<string>("");
//   const [guardrails, setGuardrails] = useState<GuardrailCheck[]>([]);
//   const [context, setContext] = useState<Record<string, any>>({});
//   const [conversationId, setConversationId] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
  
//   // Customer authentication state
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [customerInfo, setCustomerInfo] = useState<any>(null);
//   const [accountNumber, setAccountNumber] = useState<string>("");

//   // Handle customer login
//   const handleLogin = async (accNumber: string, custInfo: any) => {
//     setAccountNumber(accNumber);
//     setCustomerInfo(custInfo);
//     setIsLoggedIn(true);

//     // Initialize conversation with customer context
//     const data = await callChatAPI("", "", accNumber);
    
//     if (data) {
//       setConversationId(data.conversation_id);
//       setCurrentAgent(data.current_agent);
//       setContext(data.context);
//       const initialEvents = (data.events || []).map((e: any) => ({
//         ...e,
//         timestamp: e.timestamp ?? Date.now(),
//       }));
//       setEvents(initialEvents);
//       setAgents(data.agents || []);
//       setGuardrails(data.guardrails || []);
      
//       if (Array.isArray(data.messages)) {
//         setMessages(
//           data.messages.map((m: any) => ({
//             id: Date.now().toString() + Math.random().toString(),
//             content: m.content,
//             role: "assistant",
//             agent: m.agent,
//             timestamp: new Date(),
//           }))
//         );
//       }

//       // Add welcome message with customer info
//       const welcomeMessage: Message = {
//         id: Date.now().toString(),
//         content: `Welcome back, ${custInfo.name || "Customer"}! I can help you with your bookings, flight status, seat changes, and more. How can I assist you today?`,
//         role: "assistant",
//         agent: "Triage Agent",
//         timestamp: new Date(),
//       };
//       setMessages([welcomeMessage]);
//     }
//   };

//   // Send a user message
//   const handleSendMessage = async (content: string) => {
//     const userMsg: Message = {
//       id: Date.now().toString(),
//       content,
//       role: "user",
//       timestamp: new Date(),
//     };

//     setMessages((prev) => [...prev, userMsg]);
//     setIsLoading(true);

//     const data = await callChatAPI(content, conversationId ?? "", accountNumber);

//     if (!data) {
//       console.error("Chat API call returned no data for message:", content);
//       setMessages((prev) => [...prev, {
//         id: Date.now().toString(),
//         content: "I'm having trouble connecting right now. Please try again in a moment.",
//         role: "assistant",
//         agent: "System",
//         timestamp: new Date(),
//       }]);
//       setIsLoading(false);
//       return;
//     }

//     if (!conversationId) setConversationId(data.conversation_id || null);
//     setCurrentAgent(data.current_agent || "");
//     setContext(data.context || {});
    
//     if (data.events) {
//       const stamped = data.events.map((e: any) => ({
//         ...e,
//         timestamp: e.timestamp ?? Date.now(),
//       }));
//       setEvents((prev) => [...prev, ...stamped]);
//     }
//     if (data.agents) setAgents(data.agents);
//     if (data.guardrails) setGuardrails(data.guardrails);

//     if (data.messages) {
//       const responses: Message[] = data.messages.map((m: any) => ({
//         id: Date.now().toString() + Math.random().toString(),
//         content: m.content,
//         role: "assistant",
//         agent: m.agent,
//         timestamp: new Date(),
//       }));
//       setMessages((prev) => [...prev, ...responses]);
//     }

//     setIsLoading(false);
//   };

//   // Show login screen if not logged in
//   if (!isLoggedIn) {
//     return <CustomerLogin onLogin={handleLogin} />;
//   }

//   return (
//     <main className="flex h-screen gap-2 bg-gray-100 p-2">
//       <AgentPanel
//         agents={agents}
//         currentAgent={currentAgent}
//         events={events}
//         guardrails={guardrails}
//         context={context}
//         customerInfo={customerInfo}
//       />
//       <Chat
//         messages={messages}
//         onSendMessage={handleSendMessage}
//         isLoading={isLoading}
//         customerInfo={customerInfo}
//       />
//     </main>
//   );
// }






































"use client";

import { useEffect, useState } from "react";
import { AgentPanel } from "../components/agent-panel";
import { Chat } from "../components/Chat";
import { CustomerLogin } from "../components/customer-login";
import type { Agent, AgentEvent, GuardrailCheck, Message, ChatResponse, CustomerInfoResponse } from "@/lib/types"; // Import CustomerInfoResponse and ChatResponse
import { callChatAPI } from "../lib/api";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [currentAgent, setCurrentAgent] = useState<string>("");
  const [guardrails, setGuardrails] = useState<GuardrailCheck[]>([]);
  const [context, setContext] = useState<Record<string, any>>({});
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Customer authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfoResponse | null>(null); // Use the specific type
  const [accountNumber, setAccountNumber] = useState<string>("");

  // Handle customer login
  const handleLogin = async (accNumber: string, custInfoFromLogin: any) => { // Renamed param to avoid confusion
    setAccountNumber(accNumber);
    // You could set a basic customerInfo here from login form if needed immediately
    // setCustomerInfo({ customer: custInfoFromLogin, bookings: [] }); 

    setIsLoggedIn(true);

    // Initialize conversation with customer context - this call returns the full customer_info from backend
    const data: ChatResponse = await callChatAPI("", "", accNumber); // Specify ChatResponse type
    
    if (data) {
      setConversationId(data.conversation_id);
      setCurrentAgent(data.current_agent);
      setContext(data.context);
      const initialEvents = (data.events || []).map((e: any) => ({
        ...e,
        timestamp: e.timestamp ?? Date.now(),
      }));
      setEvents(initialEvents);
      setAgents(data.agents || []);
      setGuardrails(data.guardrails || []);
      
      if (Array.isArray(data.messages)) {
        setMessages(
          data.messages.map((m: any) => ({
            id: Date.now().toString() + Math.random().toString(),
            content: m.content,
            role: "assistant",
            agent: m.agent,
            timestamp: new Date(),
          }))
        );
      }

      // --- CRITICAL FIX: Update customerInfo state with the complete data from the API response ---
      if (data.customer_info) {
        setCustomerInfo(data.customer_info); // Use the data from the API which has email and bookings
      } else {
        setCustomerInfo(null); // Clear if no customer_info is returned
      }
      // --- END CRITICAL FIX ---

      // Add welcome message with customer info
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        content: `Welcome back, ${data.customer_info?.customer?.name || custInfoFromLogin.name || "Customer"}! I can help you with your bookings, flight status, seat changes, and more. How can I assist you today?`,
        role: "assistant",
        agent: "Triage Agent",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, welcomeMessage]); // Add welcome message to existing messages
    }
  };

  // Send a user message
  const handleSendMessage = async (content: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      content,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    const data: ChatResponse = await callChatAPI(content, conversationId ?? "", accountNumber); // Specify ChatResponse type

    if (!data) {
      console.error("Chat API call returned no data for message:", content);
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        role: "assistant",
        agent: "System",
        timestamp: new Date(),
      }]);
      setIsLoading(false);
      return;
    }

    if (!conversationId) setConversationId(data.conversation_id || null);
    setCurrentAgent(data.current_agent || "");
    setContext(data.context || {});
    
    if (data.events) {
      const stamped = data.events.map((e: any) => ({
        ...e,
        timestamp: e.timestamp ?? Date.now(),
      }));
      setEvents((prev) => [...prev, ...stamped]);
    }
    if (data.agents) setAgents(data.agents);
    if (data.guardrails) setGuardrails(data.guardrails);

    // --- CRITICAL FIX: Update customerInfo state with the complete data from the API response on every message ---
    if (data.customer_info) {
      setCustomerInfo(data.customer_info);
    } else {
      setCustomerInfo(null); // Clear if no customer_info is returned
    }
    // --- END CRITICAL FIX ---

    if (data.messages) {
      const responses: Message[] = data.messages.map((m: any) => ({
        id: Date.now().toString() + Math.random().toString(),
        content: m.content,
        role: "assistant",
        agent: m.agent,
        timestamp: new Date(),
      }));
      setMessages((prev) => [...prev, ...responses]);
    }

    setIsLoading(false);
  };

  // Show login screen if not logged in
  if (!isLoggedIn) {
    return <CustomerLogin onLogin={handleLogin} />;
  }

  return (
    <main className="flex h-screen gap-2 bg-gray-100 p-2">
      <AgentPanel
        agents={agents}
        currentAgent={currentAgent}
        events={events}
        guardrails={guardrails}
        context={context}
        customerInfo={customerInfo} // This is correctly passed
      />
      <Chat
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        customerInfo={customerInfo} // Pass customerInfo to Chat as well if needed
      />
    </main>
  );
}
