import { Link } from "react-router-dom"
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react"

export function PublicFooter() {
    return (
        <footer className="bg-zinc-950 text-zinc-400 py-16 border-t border-zinc-800">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-white mb-2">
                            <img src="/logoupdt.png" alt="HKS Foods Logo" className="h-10 w-auto" />
                            <span>HKS Foods</span>
                        </div>
                        <p className="text-zinc-500 leading-relaxed text-sm">
                            Premium food distribution partner for businesses across the UK. Delivering quality, reliability, and excellence to kitchens nationwide.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <SocialLink href="#" icon={<Facebook className="h-4 w-4" />} label="Facebook" />
                            <SocialLink href="#" icon={<Instagram className="h-4 w-4" />} label="Instagram" />
                            <SocialLink href="#" icon={<Linkedin className="h-4 w-4" />} label="LinkedIn" />
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-zinc-100 font-bold text-lg mb-6">Company</h3>
                        <ul className="space-y-3">
                            <FooterLink to="/" label="Home" />
                            <FooterLink to="/services" label="Our Services" />
                            <FooterLink to="/trusted-suppliers" label="Partner With Us" />
                            <FooterLink to="/contact" label="Contact Us" />
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-zinc-100 font-bold text-lg mb-6">Legal</h3>
                        <ul className="space-y-3">
                            <FooterLink to="/privacy-policy" label="Privacy Policy" />
                            <FooterLink to="/terms-of-service" label="Terms of Service" />
                            <FooterLink to="/cookies" label="Cookie Policy" />
                            <FooterLink to="/accessibility" label="Accessibility" />
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-zinc-100 font-bold text-lg mb-6">Get in Touch</h3>
                        <ul className="space-y-4 text-sm">
                            <ContactItem icon={<MapPin className="h-4 w-4" />} text="104 Anthony Road, Birmingham, B8 3AA" />
                            <ContactItem icon={<Phone className="h-4 w-4" />} text="+44 7477 956299" />
                            <ContactItem icon={<Mail className="h-4 w-4" />} text="info@hksfoods.com" />
                            <li className="text-zinc-500 text-xs mt-4">
                                Registered in England & Wales
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-zinc-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-600">
                    <div>© {new Date().getFullYear()} HKS Foods Ltd. All rights reserved.</div>
                    <div className="flex gap-6">
                        <Link to="/sitemap" className="hover:text-zinc-400 transition-colors">Sitemap</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}

function FooterLink({ to, label }: { to: string, label: string }) {
    return (
        <li>
            <Link to={to} className="hover:text-emerald-400 transition-colors block py-0.5">
                {label}
            </Link>
        </li>
    )
}

function SocialLink({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) {
    return (
        <a
            href={href}
            className="h-8 w-8 bg-zinc-900 rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all duration-300 flex items-center justify-center border border-zinc-800"
            aria-label={label}
        >
            {icon}
        </a>
    )
}

function ContactItem({ icon, text }: { icon: React.ReactNode, text: string }) {
    return (
        <li className="flex items-start gap-3">
            <span className="text-emerald-500 mt-0.5">{icon}</span>
            <span className="text-zinc-400">{text}</span>
        </li>
    )
}
