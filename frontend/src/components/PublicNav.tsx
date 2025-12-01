import { Link, useLocation } from "react-router-dom"
import { Menu, X } from "lucide-react"
import { useState } from "react"

export function PublicNav() {
    const location = useLocation()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const isActive = (path: string) => location.pathname === path

    const navLinks = [
        { to: "/", label: "Home" },
        { to: "/services", label: "Services" },
        { to: "/product-inventory", label: "Products Inventory" },
        { to: "/trusted-suppliers", label: "Trusted Suppliers" },
        { to: "/contact", label: "Contact Us" }
    ]

    return (
        <header className="border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50 shadow-sm">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
                        <img src="/logoupdt.png" alt="HKS Foods Logo" className="h-10 w-auto" />
                        <span className="text-gray-900">HKS Foods</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <NavLink key={link.to} to={link.to} active={isActive(link.to)}>
                                {link.label}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
                        aria-label="Toggle menu"
                        aria-expanded={mobileMenuOpen}
                    >
                        {mobileMenuOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-200 animate-fade-in">
                        <nav className="flex flex-col space-y-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`px-4 py-3 rounded-lg text-base font-medium transition-colors min-h-[48px] flex items-center touch-manipulation ${isActive(link.to)
                                            ? "bg-blue-100 text-blue-700"
                                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    )
}

function NavLink({ to, active, children }: { to: string, active: boolean, children: React.ReactNode }) {
    return (
        <Link
            to={to}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors min-h-[44px] flex items-center touch-manipulation ${active
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
        >
            {children}
        </Link>
    )
}
