import { PublicNav } from "../components/PublicNav"
import { PublicFooter } from "../components/PublicFooter"
import { Shield } from "lucide-react"

export default function Privacy() {
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
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Privacy</h1>
                        <p className="text-lg text-gray-600">Your privacy matters to us</p>
                    </div>

                    {/* Content */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 space-y-8">
                        <section>
                            <p className="text-gray-700 leading-relaxed text-lg">
                                At HKS Foods Ltd, we are committed to protecting your privacy and ensuring the security of your personal information. This page provides a brief overview of our privacy practices.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">What We Collect</h2>
                            <p className="text-gray-700 leading-relaxed">
                                We collect information necessary to provide our services, including contact details, business information, and order history. We only collect what we need to serve you better.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use It</h2>
                            <p className="text-gray-700 leading-relaxed">
                                Your information is used to process orders, improve our services, and communicate with you about your account. We never sell your personal data to third parties.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
                            <p className="text-gray-700 leading-relaxed">
                                You have the right to access, correct, or delete your personal information at any time. You can also object to processing or request data portability.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Security</h2>
                            <p className="text-gray-700 leading-relaxed">
                                We implement industry-standard security measures to protect your data from unauthorized access, alteration, or disclosure.
                            </p>
                        </section>

                        <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-600">
                            <p className="text-gray-700">
                                For complete details about our privacy practices, please read our full{" "}
                                <a href="/privacy-policy" className="text-blue-600 hover:text-blue-800 font-semibold underline">
                                    Privacy Policy
                                </a>.
                            </p>
                        </div>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                If you have any questions or concerns about your privacy:
                            </p>
                            <div className="bg-gray-50 rounded-lg p-6 space-y-2">
                                <p className="text-gray-700"><strong>HKS Foods Ltd</strong></p>
                                <p className="text-gray-700">104 Anthony Road, Birmingham, B8 3AA, United Kingdom</p>
                                <p className="text-gray-700">Email: info@hksfoods.com</p>
                                <p className="text-gray-700">Phone: +44 7477 956299</p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            <PublicFooter />
        </div>
    )
}
