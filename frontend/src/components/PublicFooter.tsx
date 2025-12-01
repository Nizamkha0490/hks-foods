import { Link } from "react-router-dom"
import { Facebook, Instagram, Linkedin } from "lucide-react"

export function PublicFooter() {
    return (
        <footer className="bg-gray-900 text-gray-300 py-16 border-t border-gray-800">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-white">
                            <img src="/logoupdt.png" alt="HKS Foods Logo" className="h-10 w-auto" />
                            <span>HKS Foods</span>
                        </div>
                        <p className="text-gray-400 leading-relaxed">
                            Premium food distribution partner for businesses across the UK. Quality, reliability, and excellence in every delivery.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-6">Quick Links</h3>
                        <ul className="space-y-3">
                            <li><Link to="/" className="hover:text-blue-400 transition-colors">Home</Link></li>
                            <li><Link to="/services" className="hover:text-blue-400 transition-colors">Our Services</Link></li>
                            <li><Link to="/product-inventory" className="hover:text-blue-400 transition-colors">Product Inventory</Link></li>
                            <li><Link to="/trusted-suppliers" className="hover:text-blue-400 transition-colors">Trusted Suppliers</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-6">Support</h3>
                        <ul className="space-y-3">
                            <li><Link to="/contact" className="hover:text-blue-400 transition-colors">Contact Us</Link></li>
                            <li><Link to="/privacy-policy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/terms-of-service" className="hover:text-blue-400 transition-colors">Terms of Service</Link></li>
                            <li><Link to="/faq" className="hover:text-blue-400 transition-colors">FAQ</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-6">Contact</h3>
                        <ul className="space-y-3 text-gray-400">
                            <li>104 Anthony Road</li>
                            <li>Birmingham, B8 3AA</li>
                            <li>United Kingdom</li>
                            <li>+44 7477 956299</li>
                            <li>info@hksfoods.com</li>
                            <li className="pt-2">
                                <div className="flex gap-4">
                                    <a href="#" className="h-8 w-8 bg-gray-800 rounded-full hover:bg-blue-600 transition-colors cursor-pointer flex items-center justify-center" aria-label="Facebook">
                                        <Facebook className="h-4 w-4" />
                                    </a>
                                    <a href="#" className="h-8 w-8 bg-gray-800 rounded-full hover:bg-pink-600 transition-colors cursor-pointer flex items-center justify-center" aria-label="Instagram">
                                        <Instagram className="h-4 w-4" />
                                    </a>
                                    <a href="#" className="h-8 w-8 bg-gray-800 rounded-full hover:bg-blue-500 transition-colors cursor-pointer flex items-center justify-center" aria-label="LinkedIn">
                                        <Linkedin className="h-4 w-4" />
                                    </a>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
                    <div>© 2025 HKS Foods Ltd. All rights reserved.</div>
                    <div className="flex gap-6">
                        <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link to="/cookies" className="hover:text-white transition-colors">Cookies</Link>
                        <Link to="/accessibility" className="hover:text-white transition-colors">Accessibility</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
