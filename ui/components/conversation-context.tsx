// "use client";

// import { PanelSection } from "./panel-section";
// import { Card, CardContent } from "@/components/ui/card";
// import { BookText } from "lucide-react";

// interface ConversationContextProps {
//   context: {
//     passenger_name?: string;
//     confirmation_number?: string;
//     seat_number?: string;
//     flight_number?: string;
//     account_number?: string;
//   };
// }

// export function ConversationContext({ context }: ConversationContextProps) {
//   return (
//     <PanelSection
//       title="Conversation Context"
//       icon={<BookText className="h-4 w-4 text-blue-600" />}
//     >
//       <Card className="bg-gradient-to-r from-white to-gray-50 border-gray-200 shadow-sm">
//         <CardContent className="p-3">
//           <div className="grid grid-cols-2 gap-2">
//             {Object.entries(context).map(([key, value]) => (
//               <div
//                 key={key}
//                 className="flex items-center gap-2 bg-white p-2 rounded-md border border-gray-200 shadow-sm transition-all"
//               >
//                 <div className="w-2 h-2 rounded-full bg-blue-500"></div>
//                 <div className="text-xs">
//                   <span className="text-zinc-500 font-light">{key}:</span>{" "}
//                   <span
//                     className={
//                       value
//                         ? "text-zinc-900 font-light"
//                         : "text-gray-400 italic"
//                     }
//                   >
//                     {value || "null"}
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </CardContent>
//       </Card>
//     </PanelSection>
//   );
// }























"use client";

import { PanelSection } from "./panel-section";
import { Card, CardContent } from "@/components/ui/card";
import { BookText } from "lucide-react";

interface ConversationContextProps {
  context: {
    passenger_name?: string;
    confirmation_number?: string;
    seat_number?: string;
    flight_number?: string;
    account_number?: string;
    // Add new fields from AirlineAgentContext that are now passed
    customer_id?: string;
    booking_id?: string;
    flight_id?: string;
    customer_email?: string;
    customer_bookings?: Array<Record<string, any>>; // Array of booking objects
    [key: string]: any; // Allow for other dynamic properties
  };
}

export function ConversationContext({ context }: ConversationContextProps) {
  // Filter out properties that are undefined, null, or empty arrays/objects for cleaner display
  const displayContextEntries = Object.entries(context || {}).filter(([key, value]) => {
    if (value === undefined || value === null) return false; // Filter out null/undefined
    if (Array.isArray(value) && value.length === 0) return false; // Filter out empty arrays
    // Filter out empty plain objects (but not arrays or other specific objects you want to display)
    if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) return false;
    return true;
  });

  return (
    <PanelSection
      title="Conversation Context"
      icon={<BookText className="h-4 w-4 text-blue-600" />}
    >
      <Card className="bg-gradient-to-r from-white to-gray-50 border-gray-200 shadow-sm">
        <CardContent className="p-3">
          <div className="grid grid-cols-2 gap-2">
            {displayContextEntries.length > 0 ? (
              displayContextEntries.map(([key, value]) => {
                let displayValue;

                if (Array.isArray(value)) {
                  // Handle arrays (e.g., customer_bookings)
                  if (key === "customer_bookings") {
                    displayValue = `${value.length} active booking${value.length === 1 ? '' : 's'}`;
                    // You could further enhance this to list specific details, e.g.:
                    // displayValue = value.map(b => b.confirmation_number).join(', ') || 'None';
                  } else {
                    // Generic array display
                    displayValue = `[${value.length} items]`;
                  }
                } else if (typeof value === 'object') {
                  // Handle other generic objects (e.g., if a complex object found its way in)
                  // For better readability, consider stringifying with indentation or picking specific fields
                  displayValue = JSON.stringify(value); 
                } else {
                  // For primitive types (string, number, boolean)
                  displayValue = String(value);
                }

                return (
                  <div
                    key={key}
                    className="flex items-center gap-2 bg-white p-2 rounded-md border border-gray-200 shadow-sm transition-all"
                  >
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <div className="text-xs">
                      <span className="text-zinc-500 font-light capitalize">
                        {key.replace(/_/g, ' ')}: {/* Nicely format key for display */}
                      </span>{" "}
                      <span
                        className={
                          displayValue && displayValue !== "null" && displayValue !== "undefined"
                            ? "text-zinc-900 font-light break-words" // Added break-words for long strings
                            : "text-gray-400 italic"
                        }
                      >
                        {displayValue || "N/A"}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 text-gray-500 italic p-2">No active context details.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </PanelSection>
  );
}
