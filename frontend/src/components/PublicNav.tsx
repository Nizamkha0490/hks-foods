import { Link, useLocation } from "react-router-dom"
import { Menu, X } from "lucide-react"
import { useState, useEffect } from "react"

export function PublicNav() {
    const location = useLocation()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const isActive = (path: string) => location.pathname === path

    const navLinks = [
        { to: "/", label: "Home" },
        { to: "/services", label: "Services" },
        { to: "/trusted-suppliers", label: "Trusted Suppliers" },
        { to: "/contact", label: "Contact Us" }
    ]

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 py-3" : "bg-transparent py-5"}`}>
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight group">
                        <div className="relative">
                            <div className="absolute inset-0 bg-emerald-500/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <img src="/logoupdt.png" alt="HKS Foods Logo" className="h-10 w-auto relative z-10" />
                        </div>
                        <span className="text-white group-hover:text-emerald-400 transition-colors">HKS Foods</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1 bg-zinc-900/50 backdrop-blur-sm p-1 rounded-full border border-zinc-800/50">
                        {navLinks.map((link) => (
                            <NavLink key={link.to} to={link.to} active={isActive(link.to)}>
                                {link.label}
                            </NavLink>
                        ))}
                    </nav>

                    {/* CTA / Mobile Menu Button */}
                    <div className="flex items-center gap-4">
                        <Link to="/contact" className="hidden md:block">
                            <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-full text-sm font-medium transition-all hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.5)]">
                                Get Started
                            </button>
                        </Link>

                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 right-0 bg-zinc-950 border-b border-zinc-800 animate-in slide-in-from-top-5">
                        <nav className="flex flex-col p-4 space-y-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`px-4 py-3 rounded-lg text-base font-medium transition-colors flex items-center ${isActive(link.to)
                                        ? "bg-emerald-500/10 text-emerald-400"
                                        : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <Link
                                to="/contact"
                                onClick={() => setMobileMenuOpen(false)}
                                className="mt-4 w-full bg-emerald-600 text-center py-3 rounded-lg text-white font-medium active:scale-95 transition-transform"
                            >
                                Get Started
                            </Link>
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
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 relative ${active
                ? "text-white bg-zinc-800 shadow-lg"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                }`}
        >
            {children}
            {active && (
                <span className="absolute inset-0 rounded-full ring-1 ring-white/10 pointer-events-none"></span>
            )}
        </Link>
    )
}
