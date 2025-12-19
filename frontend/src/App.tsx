import React, { Suspense, lazy } from "react"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { AppHeader } from "@/components/AppHeader"
import ProtectedRoute from "@/components/ProtectedRoute"
import ScrollToTop from "@/components/ScrollToTop"
import Sitemap from "./pages/Sitemap"

// Lazy Loading Pages
const Dashboard = lazy(() => import("./pages/Dashboard"))
const Products = lazy(() => import("./pages/Products"))
const Orders = lazy(() => import("./pages/Orders"))
const Customers = lazy(() => import("./pages/Customers"))
const CustomerProfile = lazy(() => import("./pages/CustomerProfile"))
const Suppliers = lazy(() => import("./pages/Suppliers"))
const SupplierProfile = lazy(() => import("./pages/SupplierProfile"))
const Ledgers = lazy(() => import("./pages/Ledgers"))
const CreditorDebitor = lazy(() => import("./pages/CreditorDebitor"))
const Expenses = lazy(() => import("./pages/Expenses"))
const Reports = lazy(() => import("./pages/Reports"))
const Settings = lazy(() => import("./pages/Settings"))
const NotFound = lazy(() => import("./pages/NotFound"))
const ForgotPasswordEmail = lazy(() => import("./pages/ForgotPasswordEmail"))
const ForgotPasswordOTP = lazy(() => import("./pages/ForgotPasswordOTP"))
const ForgotPasswordNew = lazy(() => import("./pages/ForgotPasswordNew"))

import PublicLanding from "./pages/PublicLanding"
import PublicServices from "./pages/PublicServices"
import PublicSuppliers from "./pages/PublicSuppliers"
import PublicContact from "./pages/PublicContact"
import PrivacyPolicy from "./pages/PrivacyPolicy"
import TermsOfService from "./pages/TermsOfService"
import FAQ from "./pages/FAQ"
import Cookies from "./pages/Cookies"
import Accessibility from "./pages/Accessibility"
import Privacy from "./pages/Privacy"

// Lazy Loading Pages - Keep Dashboard/Auth lazy for performance
const Login = lazy(() => import("./pages/Login"))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
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

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-bg-primary">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
)

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<PublicLanding />} />

            <Route path="/services" element={<PublicServices />} />
            <Route path="/trusted-suppliers" element={<PublicSuppliers />} />
            <Route path="/contact" element={<PublicContact />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/accessibility" element={<Accessibility />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/sitemap" element={<Sitemap />} />
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
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider >
)

export default App
