"use client";

import type React from "react";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"

export default function ForgotPasswordEmail() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      toast.success("OTP sent to your email");
      sessionStorage.setItem("resetEmail", email);
      navigate("/forgot-password-otp");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error sending OTP");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-kf-bg p-4">
      <Card className="w-full max-w-md p-8 bg-card border-kf-border card-shadow">
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 text-primary hover:text-primary/80 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Login</span>
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-metallic mb-2">Forgot Password?</h1>
          <p className="text-kf-text-mid">Enter your email to receive an OTP</p>
        </div>

        <form onSubmit={handleSendOTP} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-kf-text-light">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="bg-muted border-kf-border focus-visible:ring-primary"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={loading}
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </Button>
        </form>

        <p className="text-center text-xs text-kf-text-dark mt-6">We'll send a one-time password to your email</p>
      </Card>
    </div>
  )
}
