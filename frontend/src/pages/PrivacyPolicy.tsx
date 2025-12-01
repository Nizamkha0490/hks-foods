import { PublicNav } from "../components/PublicNav"
import { PublicFooter } from "../components/PublicFooter"
import { Shield, Lock, Eye, FileText } from "lucide-react"

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
            <PublicNav />

            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
                            <Shield className="h-10 w-10 text-blue-600" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
                        <p className="text-lg text-gray-600">Last updated: January 1, 2025</p>
                    </div>

                    {/* Content */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 space-y-8">
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                                <Lock className="h-6 w-6 text-blue-600" />
                                Introduction
                            </h2>
                            <p className="text-gray-700 leading-relaxed">
                                HKS Foods Ltd ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Personal Information</h3>
                                    <p className="text-gray-700 leading-relaxed mb-2">We may collect personal information that you provide to us, including:</p>
                                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                                        <li>Name and contact information (email, phone number, address)</li>
                                        <li>Business information (company name, VAT number)</li>
                                        <li>Payment and billing information</li>
                                        <li>Order history and preferences</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Automatically Collected Information</h3>
                                    <p className="text-gray-700 leading-relaxed mb-2">When you visit our website, we may automatically collect:</p>
                                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                                        <li>IP address and browser type</li>
                                        <li>Device information and operating system</li>
                                        <li>Pages visited and time spent on our site</li>
                                        <li>Referring website addresses</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
                            <p className="text-gray-700 leading-relaxed mb-4">We use the information we collect to:</p>
                            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                                <li>Process and fulfill your orders</li>
                                <li>Communicate with you about products, services, and updates</li>
                                <li>Improve our website and services</li>
                                <li>Prevent fraud and enhance security</li>
                                <li>Comply with legal obligations</li>
                                <li>Send marketing communications (with your consent)</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Information Sharing and Disclosure</h2>
                            <p className="text-gray-700 leading-relaxed mb-4">We may share your information with:</p>
                            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                                <li><strong>Service Providers:</strong> Third-party companies that help us operate our business</li>
                                <li><strong>Business Partners:</strong> Suppliers and distributors necessary to fulfill orders</li>
                                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                                <li><strong>Business Transfers:</strong> In connection with a merger, sale, or acquisition</li>
                            </ul>
                            <p className="text-gray-700 leading-relaxed mt-4">
                                We do not sell your personal information to third parties.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
                            <p className="text-gray-700 leading-relaxed">
                                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
                            <p className="text-gray-700 leading-relaxed mb-4">Under UK GDPR, you have the right to:</p>
                            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                                <li>Access your personal data</li>
                                <li>Rectify inaccurate personal data</li>
                                <li>Request erasure of your personal data</li>
                                <li>Object to processing of your personal data</li>
                                <li>Request restriction of processing</li>
                                <li>Data portability</li>
                                <li>Withdraw consent at any time</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies</h2>
                            <p className="text-gray-700 leading-relaxed">
                                We use cookies and similar tracking technologies to enhance your experience on our website. For more information, please see our <a href="/cookies" className="text-blue-600 hover:text-blue-800 underline">Cookies Policy</a>.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                If you have any questions about this Privacy Policy or our data practices, please contact us:
                            </p>
                            <div className="bg-gray-50 rounded-lg p-6 space-y-2">
                                <p className="text-gray-700"><strong>HKS Foods Ltd</strong></p>
                                <p className="text-gray-700">104 Anthony Road, Birmingham, B8 3AA, United Kingdom</p>
                                <p className="text-gray-700">Email: info@hksfoods.com</p>
                                <p className="text-gray-700">Phone: +44 7477 956299</p>
                            </div>
                        </section>

                        <section className="border-t pt-8">
                            <p className="text-sm text-gray-500 italic">
                                This Privacy Policy may be updated from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
                            </p>
                        </section>
                    </div>
                </div>
            </div>

            <PublicFooter />
        </div>
    )
}
