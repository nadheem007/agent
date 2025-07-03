// "use client";

// import { Bot, User } from "lucide-react";
// import type { Agent, AgentEvent, GuardrailCheck } from "@/lib/types";
// import { AgentsList } from "./agents-list";
// import { Guardrails } from "./guardrails";
// import { ConversationContext } from "./conversation-context";
// import { RunnerOutput } from "./runner-output";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// interface AgentPanelProps {
//   agents: Agent[];
//   currentAgent: string;
//   events: AgentEvent[];
//   guardrails: GuardrailCheck[];
//   context: {
//     passenger_name?: string;
//     confirmation_number?: string;
//     seat_number?: string;
//     flight_number?: string;
//     account_number?: string;
//   };
//   customerInfo?: any;
// }

// export function AgentPanel({
//   agents,
//   currentAgent,
//   events,
//   guardrails,
//   context,
//   customerInfo,
// }: AgentPanelProps) {
//   const activeAgent = agents.find((a) => a.name === currentAgent);
//   const runnerEvents = events.filter((e) => e.type !== "message");

//   return (
//     <div className="w-3/5 h-full flex flex-col border-r border-gray-200 bg-white rounded-xl shadow-sm">
//       <div className="bg-blue-600 text-white h-12 px-4 flex items-center gap-3 shadow-sm rounded-t-xl">
//         <Bot className="h-5 w-5" />
//         <h1 className="font-semibold text-sm sm:text-base lg:text-lg">Agent View</h1>
//         <span className="ml-auto text-xs font-light tracking-wide opacity-80">
//           Airline&nbsp;Co.
//         </span>
//       </div>

//       <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
//         {/* Customer Info Section */}
//         {customerInfo && (
//           <div className="mb-6">
//             <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
//               <CardHeader className="pb-2">
//                 <CardTitle className="text-sm flex items-center gap-2 text-blue-800">
//                   <User className="h-4 w-4" />
//                   Customer Information
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="pt-0">
//                 <div className="grid grid-cols-2 gap-2 text-xs">
//                   <div>
//                     <span className="text-blue-600 font-medium">Name:</span>{" "}
//                     <span className="text-gray-800">{customerInfo.customer?.name}</span>
//                   </div>
//                   <div>
//                     <span className="text-blue-600 font-medium">Account:</span>{" "}
//                     <span className="text-gray-800">{customerInfo.customer?.account_number}</span>
//                   </div>
//                   <div className="col-span-2">
//                     <span className="text-blue-600 font-medium">Email:</span>{" "}
//                     <span className="text-gray-800">{customerInfo.customer?.email}</span>
//                   </div>
//                   <div className="col-span-2">
//                     <span className="text-blue-600 font-medium">Active Bookings:</span>{" "}
//                     <span className="text-gray-800">{customerInfo.bookings?.length || 0}</span>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         )}

//         <AgentsList agents={agents} currentAgent={currentAgent} />
//         <Guardrails
//           guardrails={guardrails}
//           inputGuardrails={activeAgent?.input_guardrails ?? []}
//         />
//         <ConversationContext context={context} />
//         <RunnerOutput runnerEvents={runnerEvents} />
//       </div>
//     </div>
//   );
// }


























"use client";

import { Bot, User } from "lucide-react";
import type { Agent, AgentEvent, GuardrailCheck } from "@/lib/types";
import { AgentsList } from "./agents-list";
import { Guardrails } from "./guardrails";
import { ConversationContext } from "./conversation-context";
import { RunnerOutput } from "./runner-output";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AgentPanelProps {
  agents: Agent[];
  currentAgent: string;
  events: AgentEvent[];
  guardrails: GuardrailCheck[];
  context: {
    passenger_name?: string;
    confirmation_number?: string;
    seat_number?: string;
    flight_number?: string;
    account_number?: string;
    registration_id?: string;
    user_details?: Record<string, any>;
  };
  customerInfo?: {
    customer?: {
      name?: string;
      account_number?: string;
      email?: string;
      is_conference_attendee?: boolean;
      conference_name?: string;
      registration_id?: string;
    };
    bookings: {
      id: string;
      confirmation_number: string;
    }[];
  };
}

export function AgentPanel({
  agents,
  currentAgent,
  events,
  guardrails,
  context,
  customerInfo,
}: AgentPanelProps) {
  const activeAgent = agents.find((a) => a.name === currentAgent);
  const runnerEvents = events.filter((e) => e.type !== "message");

  return (
    <div className="w-3/5 h-full flex flex-col border-r border-gray-200 bg-white rounded-xl shadow-sm">
      <div className="bg-blue-600 text-white h-12 px-4 flex items-center gap-3 shadow-sm rounded-t-xl">
        <Bot className="h-5 w-5" />
        <h1 className="font-semibold text-sm sm:text-base lg:text-lg">Agent View</h1>
        <span className="ml-auto text-xs font-light tracking-wide opacity-80">
          Airline&nbsp;Co.
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
        {/* Customer Info Section */}
        {customerInfo && (
          <div className="mb-6">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-blue-800">
                  <User className="h-4 w-4" />
                  {customerInfo.customer?.registration_id ? 'Conference User Information' : 'Customer Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-blue-600 font-medium">Name:</span>{" "}
                    <span className="text-gray-800">{customerInfo.customer?.name}</span>
                  </div>
                  
                  {customerInfo.customer?.account_number && (
                    <div>
                      <span className="text-blue-600 font-medium">Account:</span>{" "}
                      <span className="text-gray-800">{customerInfo.customer.account_number}</span>
                    </div>
                  )}
                  
                  {customerInfo.customer?.registration_id && (
                    <div>
                      <span className="text-blue-600 font-medium">Registration ID:</span>{" "}
                      <span className="text-gray-800">{customerInfo.customer.registration_id}</span>
                    </div>
                  )}
                  
                  <div className="col-span-2">
                    <span className="text-blue-600 font-medium">Email:</span>{" "}
                    <span className="text-gray-800">{customerInfo.customer?.email}</span>
                  </div>
                  
                  {customerInfo.customer?.is_conference_attendee !== undefined && (
                    <div className="col-span-2">
                      <span className="text-blue-600 font-medium">Conference Attendee:</span>{" "}
                      <span className="text-gray-800">
                        {customerInfo.customer.is_conference_attendee ? "Yes" : "No"}
                      </span>
                    </div>
                  )}
                  
                  {customerInfo.customer?.is_conference_attendee && customerInfo.customer?.conference_name && (
                    <div className="col-span-2">
                      <span className="text-blue-600 font-medium">Conference:</span>{" "}
                      <span className="text-gray-800">{customerInfo.customer.conference_name}</span>
                    </div>
                  )}
                  
                  {customerInfo.customer?.account_number && (
                    <div className="col-span-2">
                      <span className="text-blue-600 font-medium">Active Bookings:</span>{" "}
                      <span className="text-gray-800">{customerInfo.bookings?.length || 0}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <AgentsList agents={agents} currentAgent={currentAgent} />
        <Guardrails
          guardrails={guardrails}
          inputGuardrails={activeAgent?.input_guardrails ?? []}
        />
        <ConversationContext context={context} />
        <RunnerOutput runnerEvents={runnerEvents} />
      </div>
    </div>
  );
}