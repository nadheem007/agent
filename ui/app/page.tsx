"use client";

import { useEffect, useState } from "react";
import { AgentPanel } from "../components/agent-panel";
import { Chat } from "../components/Chat";
import { CustomerLogin } from "../components/customer-login";
import type { Agent, AgentEvent, GuardrailCheck, Message, ChatResponse, CustomerInfoResponse } from "@/lib/types";
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
  const [customerInfo, setCustomerInfo] = useState<CustomerInfoResponse | null>(null);
  const [loginIdentifier, setLoginIdentifier] = useState<string>("");

  // Handle customer login
  const handleLogin = async (identifier: string, userData: any) => {
    setLoginIdentifier(identifier);
    setIsLoggedIn(true);

    // Initialize conversation with user context
    const data: ChatResponse = await callChatAPI("", "", identifier);
    
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

      // Update customerInfo state with the complete data from the API response
      if (data.customer_info) {
        setCustomerInfo(data.customer_info);
      } else {
        setCustomerInfo(null);
      }

      // Add welcome message with user info
      const details = userData.details || {};
      const welcomeName = details.user_name || `${details.firstName || ''} ${details.lastName || ''}`.trim() || "Customer";

      const welcomeMessage: Message = {
        id: Date.now().toString(),
        content: `Welcome back, ${welcomeName}! I can help you with airline services, conference schedules, business networking, and more. How can I assist you today?`,
        role: "assistant",
        agent: "Triage Agent",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, welcomeMessage]);
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

    const data: ChatResponse = await callChatAPI(
      content, 
      conversationId ?? "", 
      loginIdentifier
    );

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

    // Update customerInfo state with the complete data from the API response on every message
    if (data.customer_info) {
      setCustomerInfo(data.customer_info);
    } else {
      setCustomerInfo(null);
    }

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
        customerInfo={customerInfo}
      />
      <Chat
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        customerInfo={customerInfo}
      />
    </main>
  );
}