import { Link } from "react-router-dom"
import { PublicNav } from "@/components/PublicNav"
import { PublicFooter } from "@/components/PublicFooter"
import { ArrowRight, FileText, Home, Info, Phone, Package, Truck, Shield, HelpCircle } from "lucide-react"

export default function Sitemap() {
    const sections = [
        {
            title: "Main Pages",
            links: [
                { to: "/", label: "Home", icon: Home },
                { to: "/services", label: "Our Services", icon: Truck },
                { to: "/trusted-suppliers", label: "Trusted Suppliers", icon: Package },
                { to: "/contact", label: "Contact Us", icon: Phone },
            ]
        },
        {
            title: "Legal & Policy",
            links: [
                { to: "/privacy-policy", label: "Privacy Policy", icon: Shield },
                { to: "/terms-of-service", label: "Terms of Service", icon: FileText },
                { to: "/cookies", label: "Cookie Policy", icon: Info },
                { to: "/accessibility", label: "Accessibility Statement", icon: Info },
            ]
        },
        {
            title: "Support",
            links: [
                { to: "/faq", label: "Frequently Asked Questions", icon: HelpCircle },
            ]
        }
    ]

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col font-sans text-zinc-100 selection:bg-emerald-500/30">
            <PublicNav />

            <main className="flex-grow pt-24 pb-16">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="mb-12 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 mb-4">
                            Sitemap
                        </h1>
                        <p className="text-zinc-400 max-w-2xl mx-auto">
                            Overview of the available pages on HKS Foods.
                        </p>
                    </div>

                    <div className="grid gap-12">
                        {sections.map((section, idx) => (
                            <div key={idx} className="space-y-6">
                                <h2 className="text-2xl font-bold text-zinc-100 border-b border-zinc-800 pb-2">
                                    {section.title}
                                </h2>
                                <div className="grid gap-4 md:grid-cols-2">
                                    {section.links.map((link, linkIdx) => (
                                        <Link
                                            key={linkIdx}
                                            to={link.to}
                                            className="group flex items-center p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-900 transition-all duration-300"
                                        >
                                            <div className="mr-4 p-2 rounded-full bg-zinc-800 text-emerald-400 group-hover:bg-emerald-500/10 group-hover:text-emerald-300 transition-colors">
                                                <link.icon className="h-5 w-5" />
                                            </div>
                                            <span className="text-lg font-medium group-hover:text-emerald-300 transition-colors">
                                                {link.label}
                                            </span>
                                            <ArrowRight className="ml-auto h-5 w-5 text-zinc-600 group-hover:text-emerald-400 transform group-hover:translate-x-1 transition-all" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <PublicFooter />
        </div>
    )
}
