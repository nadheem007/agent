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
import { User, Plane, Users } from "lucide-react";

interface CustomerLoginProps {
  onLogin: (identifier: string, customerInfo: any, loginType: 'customer' | 'user') => void;
}

export function CustomerLogin({ onLogin }: CustomerLoginProps) {
  const [identifier, setIdentifier] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginType, setLoginType] = useState<'customer' | 'user'>('user');

  const handleLogin = async () => {
    if (!identifier.trim()) {
      setError(`Please enter your ${loginType === 'customer' ? 'account number' : 'registration ID'}`);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const endpoint = loginType === 'customer' 
        ? `http://localhost:8000/customer/${identifier}`
        : `http://localhost:8000/user/${identifier}`;
        
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          setError(`${loginType === 'customer' ? 'Account number' : 'Registration ID'} not found. Please check and try again.`);
        } else {
          setError("Failed to load information. Please try again.");
        }
        return;
      }

      const userData = await response.json();
      
      // Validate data based on login type
      if (loginType === 'customer') {
        if (!userData || !userData.name || !userData.account_number) {
          setError("Invalid customer data received. Please try again.");
          return;
        }
      } else {
        if (!userData || !userData.details) {
          setError("Invalid user data received. Please try again.");
          return;
        }
      }

      onLogin(identifier, userData, loginType);
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
            Access your account for personalized assistance with flights and conference information
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Login Type Selector */}
          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setLoginType('user')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                loginType === 'user'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              Conference User
            </button>
            <button
              onClick={() => setLoginType('customer')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                loginType === 'customer'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <User className="h-4 w-4 inline mr-2" />
              Airline Customer
            </button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="identifier" className="text-sm font-medium text-gray-700">
              {loginType === 'customer' ? 'Account Number' : 'Registration ID'}
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="identifier"
                type="text"
                placeholder={loginType === 'customer' ? 'e.g., CUST001' : 'e.g., 50464'}
                value={identifier}
                onChange={(e) => setIdentifier(loginType === 'customer' ? e.target.value.toUpperCase() : e.target.value)}
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
            disabled={isLoading || !identifier.trim()}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            {isLoading ? "Loading..." : "Access My Account"}
          </Button>

          <div className="text-center text-xs text-gray-500 mt-4">
            <p>Demo {loginType === 'customer' ? 'Account Numbers' : 'Registration IDs'}:</p>
            <div className="flex justify-center gap-2 mt-1 flex-wrap">
              {loginType === 'customer' ? (
                <>
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">CUST001</code>
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">CUST002</code>
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">CUST003</code>
                </>
              ) : (
                <>
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">50464</code>
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">50263</code>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}