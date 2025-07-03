"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Plane } from "lucide-react";

interface CustomerLoginProps {
  onLogin: (identifier: string, customerInfo: any) => void;
}

export function CustomerLogin({ onLogin }: CustomerLoginProps) {
  const [identifier, setIdentifier] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!identifier.trim()) {
      setError("Please enter your registration ID");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const endpoint = `http://localhost:8000/user/${identifier}`;
        
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          setError("Registration ID not found. Please check and try again.");
        } else {
          setError("Failed to load information. Please try again.");
        }
        return;
      }

      const userData = await response.json();
      
      if (!userData || !userData.details) {
        setError("Invalid user data received. Please try again.");
        return;
      }

      onLogin(identifier, userData);
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
            Aviation Tech Summit 2025
          </CardTitle>
          <p className="text-gray-600 text-sm">
            Access your account for airline services, conference information, and business networking
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="identifier" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Registration ID
            </Label>
            <Input
              id="identifier"
              type="text"
              placeholder="e.g., 50464"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              onKeyPress={handleKeyPress}
              className="h-12 text-center font-mono tracking-wider"
              disabled={isLoading}
            />
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
            <p>Demo Registration IDs:</p>
            <div className="flex justify-center gap-2 mt-1 flex-wrap">
              <code className="bg-gray-100 px-2 py-1 rounded text-xs">50464</code>
              <code className="bg-gray-100 px-2 py-1 rounded text-xs">50263</code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}