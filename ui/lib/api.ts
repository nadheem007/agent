// // Helper to call the server
// export async function callChatAPI(message: string, conversationId: string, accountNumber?: string) {
//   try {
//     const body: any = { 
//       conversation_id: conversationId, 
//       message 
//     };
    
//     if (accountNumber) {
//       body.account_number = accountNumber;
//     }

//     const res = await fetch("/chat", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(body),
//     });
    
//     if (!res.ok) throw new Error(`Chat API error: ${res.status}`);
//     return res.json();
//   } catch (err) {
//     console.error("Error sending message:", err);
//     return null;
//   }
// }

// // Helper to get customer information
// export async function getCustomerInfo(accountNumber: string) {
//   try {
//     const res = await fetch(`/customer/${accountNumber}`);
//     if (!res.ok) throw new Error(`Customer API error: ${res.status}`);
//     return res.json();
//   } catch (err) {
//     console.error("Error fetching customer info:", err);
//     return null;
//   }
// }

// // Helper to get booking information
// export async function getBookingInfo(confirmationNumber: string) {
//   try {
//     const res = await fetch(`/booking/${confirmationNumber}`);
//     if (!res.ok) throw new Error(`Booking API error: ${res.status}`);
//     return res.json();
//   } catch (err) {
//     console.error("Error fetching booking info:", err);
//     return null;
//   }
// }











// Helper to call the server

// Define your backend API base URL.
// IMPORTANT: This must match the port your FastAPI server is running on (e.g., 8000).
const BACKEND_API_BASE_URL = "http://localhost:8000"; 

export async function callChatAPI(message: string, conversationId: string, accountNumber?: string) {
  try {
    const body: any = { 
      conversation_id: conversationId, 
      message 
    };
    
    if (accountNumber) {
      body.account_number = accountNumber;
    }

    // Use the defined base URL for the chat endpoint
    const res = await fetch(`${BACKEND_API_BASE_URL}/chat`, { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    
    if (!res.ok) throw new Error(`Chat API error: ${res.status}`);
    return res.json();
  } catch (err) {
    console.error("Error sending message:", err);
    return null;
  }
}

// Helper to get customer information
export async function getCustomerInfo(accountNumber: string) {
  try {
    // Use the defined base URL for the customer endpoint
    const res = await fetch(`${BACKEND_API_BASE_URL}/customer/${accountNumber}`); 
    if (!res.ok) throw new Error(`Customer API error: ${res.status}`);
    return res.json();
  } catch (err) {
    console.error("Error fetching customer info:", err);
    return null;
  }
}

// Helper to get booking information
export async function getBookingInfo(confirmationNumber: string) {
  try {
    // Use the defined base URL for the booking endpoint
    const res = await fetch(`${BACKEND_API_BASE_URL}/booking/${confirmationNumber}`); 
    if (!res.ok) throw new Error(`Booking API error: ${res.status}`);
    return res.json();
  } catch (err) {
    console.error("Error fetching booking info:", err);
    return null;
  }
}
