"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"

export default function ForgotPasswordOTP() {
  const navigate = useNavigate()
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("resetEmail")
    if (!storedEmail) {
      toast.error("Please start from the beginning")
      navigate("/forgot-password-email")
      return
    }
    setEmail(storedEmail)
  }, [navigate])

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/verify-otp", { email, otp });
      toast.success("OTP verified successfully");
      sessionStorage.setItem("resetToken", response.data.token);
      navigate("/forgot-password-new");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error verifying OTP");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

//   const handleResendOTP = async () => {
//   setResendLoading(true)
//   try {
//     const response = await fetch("http://localhost:5000/api/auth/resend-otp", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ email }),
//     })

//     const data = await response.json()

//     if (response.ok) {
//       toast.success("OTP resent successfully")
//       setCountdown(60) // 60 seconds countdown
//       // Show OTP in development
//       if (data.otp) {
//         console.log("New OTP:", data.otp)
//         toast.info(`Development OTP: ${data.otp}`, { duration: 10000 })
//       }
//     } else {
//       // Show the actual error message from backend
//       toast.error(data.message || `Failed to resend OTP: ${response.status}`)
//       console.error('Resend OTP error:', data)
//     }
//   } catch (error) {
//     console.error('Resend OTP network error:', error)
//     toast.error("Network error. Please check if server is running.")
//   } finally {
//     setResendLoading(false)
//   }
// }


const handleResendOTP = async () => {
  setResendLoading(true);
  try {
    const response = await api.post("/auth/resend-otp", { email });
    toast.success("OTP resent successfully");
    setCountdown(60);
    if (response.data.otp) {
      console.log("New OTP:", response.data.otp);
      toast.info(`Development OTP: ${response.data.otp}`, {
        duration: 10000,
      });
    }
  } catch (error: any) {
    toast.error(
      error.response?.data?.message ||
        "Network error. Please check if server is running."
    );
    console.error("Resend OTP error:", error);
  } finally {
    setResendLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-kf-bg p-4">
      <Card className="w-full max-w-md p-8 bg-card border-kf-border card-shadow">
        <button
          onClick={() => navigate("/forgot-password-email")}
          className="flex items-center gap-2 text-primary hover:text-primary/80 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-metallic mb-2">Verify OTP</h1>
          <p className="text-kf-text-mid">Enter the OTP sent to {email}</p>
        </div>

        <form onSubmit={handleVerifyOTP} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="otp" className="text-kf-text-light">
              One-Time Password
            </Label>
            <Input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              className="bg-muted border-kf-border focus-visible:ring-primary text-center text-2xl tracking-widest"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Confirm OTP"}
          </Button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-kf-text-dark mb-4">
            Didn't receive the OTP? Check your spam folder
          </p>
          
          <Button
            variant="link"
            onClick={handleResendOTP}
            disabled={resendLoading || countdown > 0}
            className="text-primary"
          >
            {resendLoading ? "Sending..." : countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
          </Button>
        </div>

        {/* Development helper - show OTP if available */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 rounded text-center">
            <p className="text-sm text-yellow-800">
              💡 Development: Check console for OTP
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
