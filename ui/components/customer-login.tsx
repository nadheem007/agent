// "use client";

// import { useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { User, Plane } from "lucide-react";

// interface CustomerLoginProps {
//   onLogin: (accountNumber: string, customerInfo: any) => void;
// }

// export function CustomerLogin({ onLogin }: CustomerLoginProps) {
//   const [accountNumber, setAccountNumber] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleLogin = async () => {
//     if (!accountNumber.trim()) {
//       setError("Please enter your account number");
//       return;
//     }

//     setIsLoading(true);
//     setError("");

//     try {
//       const response = await fetch(`/customer/${accountNumber}`);
//       if (!response.ok) {
//         if (response.status === 404) {
//           setError("Account number not found. Please check and try again.");
//         } else {
//           setError("Failed to load customer information. Please try again.");
//         }
//         return;
//       }

//       const customerData = await response.json();
//       onLogin(accountNumber, customerData);
//     } catch (err) {
//       setError("Network error. Please check your connection and try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === "Enter") {
//       handleLogin();
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
//       <Card className="w-full max-w-md shadow-xl border-0">
//         <CardHeader className="text-center pb-2">
//           <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
//             <Plane className="h-8 w-8 text-white" />
//           </div>
//           <CardTitle className="text-2xl font-bold text-gray-900">
//             Airline Customer Service
//           </CardTitle>
//           <p className="text-gray-600 text-sm">
//             Enter your account number to access your bookings and get personalized assistance
//           </p>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="space-y-2">
//             <Label htmlFor="account" className="text-sm font-medium text-gray-700">
//               Account Number
//             </Label>
//             <div className="relative">
//               <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//               <Input
//                 id="account"
//                 type="text"
//                 placeholder="e.g., CUST001"
//                 value={accountNumber}
//                 onChange={(e) => setAccountNumber(e.target.value.toUpperCase())}
//                 onKeyPress={handleKeyPress}
//                 className="pl-10 h-12 text-center font-mono tracking-wider"
//                 disabled={isLoading}
//               />
//             </div>
//           </div>

//           {error && (
//             <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md border border-red-200">
//               {error}
//             </div>
//           )}

//           <Button
//             onClick={handleLogin}
//             disabled={isLoading || !accountNumber.trim()}
//             className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
//           >
//             {isLoading ? "Loading..." : "Access My Account"}
//           </Button>

//           <div className="text-center text-xs text-gray-500 mt-4">
//             <p>Demo Account Numbers:</p>
//             <div className="flex justify-center gap-2 mt-1">
//               <code className="bg-gray-100 px-2 py-1 rounded text-xs">CUST001</code>
//               <code className="bg-gray-100 px-2 py-1 rounded text-xs">CUST002</code>
//               <code className="bg-gray-100 px-2 py-1 rounded text-xs">CUST003</code>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }










"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Plane } from "lucide-react";

interface CustomerLoginProps {
  onLogin: (accountNumber: string, customerInfo: any) => void;
}

export function CustomerLogin({ onLogin }: CustomerLoginProps) {
  const [accountNumber, setAccountNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!accountNumber.trim()) {
      setError("Please enter your account number");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`http://localhost:8000/customer/${accountNumber}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        if (response.status === 404) {
          setError("Account number not found. Please check and try again.");
        } else {
          setError("Failed to load customer information. Please try again.");
        }
        return;
      }

      const customerData = await response.json();
      // Validate customer data
      if (!customerData || !customerData.name || !customerData.account_number) {
        setError("Invalid customer data received. Please try again.");
        return;
      }

      onLogin(accountNumber, customerData);
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Plane className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Airline Customer Service
          </CardTitle>
          <p className="text-gray-600 text-sm">
            Enter your account number to access your bookings and get personalized assistance
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="account" className="text-sm font-medium text-gray-700">
              Account Number
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="account"
                type="text"
                placeholder="e.g., CUST001"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                className="pl-10 h-12 text-center font-mono tracking-wider"
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md border border-red-200">
              {error}
            </div>
          )}

          <Button
            onClick={handleLogin}
            disabled={isLoading || !accountNumber.trim()}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            {isLoading ? "Loading..." : "Access My Account"}
          </Button>

          <div className="text-center text-xs text-gray-500 mt-4">
            <p>Demo Account Numbers:</p>
            <div className="flex justify-center gap-2 mt-1">
              <code className="bg-gray-100 px-2 py-1 rounded text-xs">CUST001</code>
              <code className="bg-gray-100 px-2 py-1 rounded text-xs">CUST002</code>
              <code className="bg-gray-100 px-2 py-1 rounded text-xs">CUST003</code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}