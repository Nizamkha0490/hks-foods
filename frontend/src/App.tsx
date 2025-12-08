import type React from "react"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { AppHeader } from "@/components/AppHeader"
import ProtectedRoute from "@/components/ProtectedRoute"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Products from "./pages/Products"
import Orders from "./pages/Orders"
import Customers from "./pages/Customers"
import CustomerProfile from "./pages/CustomerProfile"
import Suppliers from "./pages/Suppliers"
import SupplierProfile from "./pages/SupplierProfile"
import Ledgers from "./pages/Ledgers"
import CreditorDebitor from "./pages/CreditorDebitor"
import Expenses from "./pages/Expenses"
import Reports from "./pages/Reports"
import Settings from "./pages/Settings"
import NotFound from "./pages/NotFound"
import ForgotPasswordEmail from "./pages/ForgotPasswordEmail"
import ForgotPasswordOTP from "./pages/ForgotPasswordOTP"
import ForgotPasswordNew from "./pages/ForgotPasswordNew"
import PublicLanding from "./pages/PublicLanding"
import PublicProducts from "./pages/PublicProducts"
import PublicServices from "./pages/PublicServices"
import PublicSuppliers from "./pages/PublicSuppliers"
import PublicContact from "./pages/PublicContact"
import PrivacyPolicy from "./pages/PrivacyPolicy"
import TermsOfService from "./pages/TermsOfService"
import FAQ from "./pages/FAQ"
import Cookies from "./pages/Cookies"
import Accessibility from "./pages/Accessibility"
import Privacy from "./pages/Privacy"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh, no refetch
      gcTime: 10 * 60 * 1000, // 10 minutes - garbage collection time (was cacheTime)
    },
  },
})

const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <SidebarProvider>
    <div className="flex min-h-screen w-full bg-bg-primary">
      <AppSidebar />
      <div className="flex-1 flex flex-col w-full">
        <AppHeader />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  </SidebarProvider>
)

import ScrollToTop from "@/components/ScrollToTop"

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<PublicLanding />} />
          <Route path="/product-inventory" element={<PublicProducts />} />
          <Route path="/services" element={<PublicServices />} />
          <Route path="/trusted-suppliers" element={<PublicSuppliers />} />
          <Route path="/contact" element={<PublicContact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/accessibility" element={<Accessibility />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password-email" element={<ForgotPasswordEmail />} />
          <Route path="/forgot-password-otp" element={<ForgotPasswordOTP />} />
          <Route path="/forgot-password-new" element={<ForgotPasswordNew />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <CustomerProfile />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Products />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Orders />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Customers />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/suppliers"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Suppliers />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/suppliers/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <SupplierProfile />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ledgers"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Ledgers />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/creditor-debitor"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <CreditorDebitor />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/expenses"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Expenses />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Reports />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Settings />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* 404 page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider >
)

export default App
