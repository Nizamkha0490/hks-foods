"use client"

import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token")
      
      if (!token) {
        setIsAuthenticated(false)
        navigate("/login", { 
          replace: true,
          state: { from: location }
        })
        return
      }

      try {
        const response = await fetch("http://localhost:5000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          setIsAuthenticated(true)
        } else {
          // Token is invalid
          localStorage.removeItem("token")
          localStorage.removeItem("admin")
          setIsAuthenticated(false)
          navigate("/login", { 
            replace: true,
            state: { from: location }
          })
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        localStorage.removeItem("token")
        localStorage.removeItem("admin")
        setIsAuthenticated(false)
        navigate("/login", { 
          replace: true,
          state: { from: location }
        })
      }
    }

    checkAuth()
  }, [navigate, location])

  // Show loading spinner while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-kf-bg">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-kf-wheat to-kf-text-dark flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kf-accent"></div>
          </div>
          <p className="text-kf-text-mid">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  return isAuthenticated ? <>{children}</> : null
}
