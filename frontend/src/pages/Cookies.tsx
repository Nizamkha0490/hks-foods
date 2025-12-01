import { PublicNav } from "../components/PublicNav"
import { PublicFooter } from "../components/PublicFooter"
import { Cookie, Settings, CheckCircle } from "lucide-react"

export default function Cookies() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
            <PublicNav />

            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
                            <Cookie className="h-10 w-10 text-blue-600" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Cookie Policy</h1>
                        <p className="text-lg text-gray-600">Last updated: January 1, 2025</p>
                    </div>

                    {/* Content */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 space-y-8">
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">What Are Cookies?</h2>
                            <p className="text-gray-700 leading-relaxed">
                                Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our site.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Cookies</h2>
                            <p className="text-gray-700 leading-relaxed mb-4">We use cookies for the following purposes:</p>

                            <div className="space-y-6">
                                <div className="border-l-4 border-blue-600 pl-6">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5 text-blue-600" />
                                        Essential Cookies
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed">
                                        These cookies are necessary for the website to function properly. They enable basic functions like page navigation, access to secure areas, and remembering your login status.
                                    </p>
                                </div>

                                <div className="border-l-4 border-green-600 pl-6">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                        <Settings className="h-5 w-5 text-green-600" />
                                        Functional Cookies
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed">
                                        These cookies allow us to remember choices you make (such as your language preference) and provide enhanced, personalized features.
                                    </p>
                                </div>

                                <div className="border-l-4 border-purple-600 pl-6">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Analytics Cookies</h3>
                                    <p className="text-gray-700 leading-relaxed">
                                        We use analytics cookies to understand how visitors interact with our website. This helps us improve our site and services. These cookies collect information anonymously.
                                    </p>
                                </div>

                                <div className="border-l-4 border-orange-600 pl-6">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Marketing Cookies</h3>
                                    <p className="text-gray-700 leading-relaxed">
                                        These cookies track your online activity to help us deliver more relevant advertising and limit the number of times you see an advertisement.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Cookies</h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                We may use third-party services that also set cookies on your device. These include:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                                <li>Google Analytics for website analytics</li>
                                <li>Social media platforms for sharing content</li>
                                <li>Payment processors for secure transactions</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Managing Cookies</h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                You can control and manage cookies in various ways:
                            </p>

                            <div className="bg-blue-50 rounded-lg p-6 space-y-4">
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Browser Settings</h3>
                                    <p className="text-gray-700">
                                        Most browsers allow you to refuse or accept cookies. You can usually find these settings in the 'Options' or 'Preferences' menu of your browser.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Cookie Consent Tool</h3>
                                    <p className="text-gray-700">
                                        When you first visit our website, you'll see a cookie consent banner where you can choose which types of cookies to accept.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                                <p className="text-sm text-gray-700">
                                    <strong>Note:</strong> Blocking some types of cookies may impact your experience on our website and limit the services we can offer.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookie Duration</h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                Cookies can be either session cookies or persistent cookies:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                                <li><strong>Session Cookies:</strong> Temporary cookies that are deleted when you close your browser</li>
                                <li><strong>Persistent Cookies:</strong> Remain on your device for a set period or until you delete them</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Updates to This Policy</h2>
                            <p className="text-gray-700 leading-relaxed">
                                We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our business practices. Please check this page periodically for updates.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                If you have questions about our use of cookies, please contact us:
                            </p>
                            <div className="bg-gray-50 rounded-lg p-6 space-y-2">
                                <p className="text-gray-700"><strong>HKS Foods Ltd</strong></p>
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
