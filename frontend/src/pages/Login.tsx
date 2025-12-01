"use client";

import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [remember, setRemember] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error("Please enter both email and password");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email: email.trim(),
        password: password.trim(),
      });

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("admin", JSON.stringify(response.data.admin));

        if (remember) {
          localStorage.setItem("rememberMe", "true");
        } else {
          localStorage.removeItem("rememberMe");
        }

        toast.success("Login successful!");
        navigate("/dashboard", { replace: true });
      } else {
        toast.error(
          response.data.message || "Login failed. Please check your credentials."
        );
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(
        error.response?.data?.message ||
        "Network error. Please check if the server is running."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-kf-bg p-4">
      <Card className="w-full max-w-md p-8 bg-card border-kf-border card-shadow">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-kf-wheat to-kf-text-dark flex items-center justify-center">
            <span className="text-3xl font-bold text-kf-accent">K</span>
          </div>
          <h1 className="text-3xl font-bold text-metallic mb-2">HKS Foods Ltd</h1>
          {/* <p className="text-kf-text-mid">HKS Management System</p> */}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-kf-text-light">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="bg-muted border-kf-border focus-visible:ring-primary pr-10"
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-kf-text-mid hover:text-kf-text-light transition-colors"
                disabled={isLoading}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={remember}
                onCheckedChange={(checked) => setRemember(checked as boolean)}
                disabled={isLoading}
              />
              <Label htmlFor="remember" className="text-sm text-kf-text-mid cursor-pointer">
                Remember me
              </Label>
            </div>
            <Button
              variant="link"
              className="text-primary p-0 h-auto font-normal"
              type="button"
              onClick={() => navigate("/forgot-password-email")}
              disabled={isLoading}
            >
              Forgot password?
            </Button>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        {/* <div className="mt-6 p-4 bg-kf-wheat/10 rounded-lg border border-kf-border">
          <p className="text-center text-xs text-kf-text-dark">
            <strong>Default Credentials:</strong><br />
            Email: admin@khyberfoods.com<br />
            Password: admin123
          </p>
        </div> */}
      </Card>
    </div>
  )
}
