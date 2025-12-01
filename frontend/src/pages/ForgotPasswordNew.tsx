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
import { ArrowLeft, Eye, EyeOff } from "lucide-react"

export default function ForgotPasswordNew() {
  const navigate = useNavigate()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("resetEmail")
    const resetToken = sessionStorage.getItem("resetToken")

    if (!storedEmail || !resetToken) {
      toast.error("Session expired. Please start again")
      navigate("/forgot-password-email")
      return
    }
    setEmail(storedEmail)
  }, [navigate])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const resetToken = sessionStorage.getItem("resetToken");
      await api.post("/auth/reset-password", {
        email,
        password,
        token: resetToken,
      });
      toast.success("Password reset successfully");
      sessionStorage.removeItem("resetEmail");
      sessionStorage.removeItem("resetToken");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error resetting password");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-kf-bg p-4">
      <Card className="w-full max-w-md p-8 bg-card border-kf-border card-shadow">
        <button
          onClick={() => navigate("/forgot-password-otp")}
          className="flex items-center gap-2 text-primary hover:text-primary/80 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-metallic mb-2">Set New Password</h1>
          <p className="text-kf-text-mid">Create a strong password for your account</p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-kf-text-light">
              New Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="bg-muted border-kf-border focus-visible:ring-primary pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-kf-text-mid hover:text-kf-text-light"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-kf-text-light">
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="bg-muted border-kf-border focus-visible:ring-primary pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-kf-text-mid hover:text-kf-text-light"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={loading}
          >
            {loading ? "Resetting Password..." : "Reset Password"}
          </Button>
        </form>

        <p className="text-center text-xs text-kf-text-dark mt-6">Password must be at least 6 characters long</p>
      </Card>
    </div>
  )
}
