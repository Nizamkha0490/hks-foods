import { PublicNav } from "../components/PublicNav"
import { PublicFooter } from "../components/PublicFooter"
import { Accessibility as AccessibilityIcon, Check, Eye, Keyboard, Volume2 } from "lucide-react"

export default function Accessibility() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
            <PublicNav />

            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
                            <AccessibilityIcon className="h-10 w-10 text-blue-600" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Accessibility Statement</h1>
                        <p className="text-lg text-gray-600">Our commitment to digital accessibility</p>
                    </div>

                    {/* Content */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 space-y-8">
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Commitment</h2>
                            <p className="text-gray-700 leading-relaxed">
                                HKS Foods Ltd is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Conformance Status</h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA. These guidelines explain how to make web content more accessible for people with disabilities.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Accessibility Features</h2>
                            <p className="text-gray-700 leading-relaxed mb-6">
                                Our website includes the following accessibility features:
                            </p>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <Keyboard className="h-6 w-6 text-blue-600" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-2">Keyboard Navigation</h3>
                                        <p className="text-gray-700 text-sm">
                                            Full keyboard navigation support for users who cannot use a mouse
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                            <Eye className="h-6 w-6 text-green-600" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-2">Screen Reader Compatible</h3>
                                        <p className="text-gray-700 text-sm">
                                            Semantic HTML and ARIA labels for screen reader users
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <Check className="h-6 w-6 text-purple-600" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-2">Color Contrast</h3>
                                        <p className="text-gray-700 text-sm">
                                            Sufficient color contrast ratios for text readability
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                            <Volume2 className="h-6 w-6 text-orange-600" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-2">Alternative Text</h3>
                                        <p className="text-gray-700 text-sm">
                                            Descriptive alt text for all images and visual content
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Additional Features</h2>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                                    <span className="text-gray-700">Resizable text without loss of content or functionality</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                                    <span className="text-gray-700">Clear and consistent navigation throughout the site</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                                    <span className="text-gray-700">Descriptive page titles and headings</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                                    <span className="text-gray-700">Form labels and error messages that are clearly associated with inputs</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                                    <span className="text-gray-700">Skip navigation links for keyboard users</span>
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Known Limitations</h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                Despite our best efforts, some limitations may exist:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                                <li>Some third-party content may not be fully accessible</li>
                                <li>Older PDF documents may not meet current accessibility standards</li>
                                <li>Some complex data visualizations may require alternative formats</li>
                            </ul>
                            <p className="text-gray-700 leading-relaxed mt-4">
                                We are actively working to address these limitations and improve accessibility across all content.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Feedback and Assistance</h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                We welcome your feedback on the accessibility of our website. If you encounter any accessibility barriers, please let us know:
                            </p>
                            <div className="bg-gray-50 rounded-lg p-6 space-y-2">
                                <p className="text-gray-700"><strong>HKS Foods Ltd</strong></p>
                                <p className="text-gray-700">Email: info@hksfoods.com</p>
                                <p className="text-gray-700">Phone: +44 7477 956299</p>
                                <p className="text-gray-700 mt-4">
                                    We aim to respond to accessibility feedback within 5 business days.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Technical Specifications</h2>
                            <p className="text-gray-700 leading-relaxed">
                                Accessibility of our website relies on the following technologies:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-4">
                                <li>HTML5</li>
                                <li>WAI-ARIA</li>
                                <li>CSS3</li>
                                <li>JavaScript</li>
                            </ul>
                        </section>

                        <section className="border-t pt-8">
                            <p className="text-sm text-gray-500 italic">
                                This accessibility statement was last reviewed on January 1, 2025. We review and update this statement regularly as we continue to improve our website's accessibility.
                            </p>
                        </section>
                    </div>
                </div>
            </div>

            <PublicFooter />
        </div>
    )
}
