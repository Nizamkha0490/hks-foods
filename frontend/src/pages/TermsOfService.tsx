import { PublicNav } from "../components/PublicNav"
import { PublicFooter } from "../components/PublicFooter"
import { FileText, AlertCircle, CheckCircle } from "lucide-react"

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
            <PublicNav />

            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
                            <FileText className="h-10 w-10 text-blue-600" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Terms of Service</h1>
                        <p className="text-lg text-gray-600">Last updated: January 1, 2025</p>
                    </div>

                    {/* Content */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 space-y-8">
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                            <p className="text-gray-700 leading-relaxed">
                                By accessing and using the services provided by HKS Foods Ltd, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our services.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Services Description</h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                HKS Foods Ltd provides premium food distribution services to businesses across the UK. Our services include:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                                <li>Wholesale food distribution</li>
                                <li>Product sourcing and supply</li>
                                <li>Inventory management solutions</li>
                                <li>Delivery and logistics services</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Account Registration</h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                To use certain features of our services, you may be required to register for an account. You agree to:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                                <li>Provide accurate, current, and complete information</li>
                                <li>Maintain and promptly update your account information</li>
                                <li>Maintain the security of your password and account</li>
                                <li>Accept responsibility for all activities under your account</li>
                                <li>Notify us immediately of any unauthorized use</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Orders and Payments</h2>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Order Placement</h3>
                                    <p className="text-gray-700 leading-relaxed">
                                        All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order for any reason.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Pricing</h3>
                                    <p className="text-gray-700 leading-relaxed">
                                        Prices are subject to change without notice. The price charged will be the price in effect at the time the order is placed.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Payment Terms</h3>
                                    <p className="text-gray-700 leading-relaxed">
                                        Payment is due according to the terms agreed upon at the time of order. Late payments may incur additional charges.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Delivery</h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                We will make reasonable efforts to deliver products on the agreed date. However, delivery times are estimates and not guaranteed. We are not liable for delays caused by circumstances beyond our control.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Returns and Refunds</h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                Due to the nature of food products, returns are only accepted for:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                                <li>Damaged or defective products</li>
                                <li>Incorrect items delivered</li>
                                <li>Products not meeting quality standards</li>
                            </ul>
                            <p className="text-gray-700 leading-relaxed mt-4">
                                Claims must be made within 24 hours of delivery with photographic evidence.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Limitation of Liability</h2>
                            <p className="text-gray-700 leading-relaxed">
                                To the maximum extent permitted by law, HKS Foods Ltd shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our services.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Intellectual Property</h2>
                            <p className="text-gray-700 leading-relaxed">
                                All content on our website, including text, graphics, logos, and images, is the property of HKS Foods Ltd and protected by intellectual property laws.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Governing Law</h2>
                            <p className="text-gray-700 leading-relaxed">
                                These Terms of Service shall be governed by and construed in accordance with the laws of England and Wales.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Information</h2>
                            <div className="bg-gray-50 rounded-lg p-6 space-y-2">
                                <p className="text-gray-700"><strong>HKS Foods Ltd</strong></p>
                                <p className="text-gray-700">104 Anthony Road, Birmingham, B8 3AA, United Kingdom</p>
                                <p className="text-gray-700">Email: info@hksfoods.com</p>
                                <p className="text-gray-700">Phone: +44 7477 956299</p>
                            </div>
                        </section>

                        <section className="border-t pt-8">
                            <p className="text-sm text-gray-500 italic">
                                We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to the website.
                            </p>
                        </section>
                    </div>
                </div>
            </div>

            <PublicFooter />
        </div>
    )
}
