import { PublicNav } from "../components/PublicNav"
import { PublicFooter } from "../components/PublicFooter"
import { HelpCircle, ChevronDown } from "lucide-react"
import { useState } from "react"

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null)

    const faqs = [
        {
            question: "What areas do you deliver to?",
            answer: "We deliver to businesses across the United Kingdom. Our primary service area includes Birmingham and surrounding regions, with extended delivery available to most UK locations. Contact us for specific delivery availability to your area."
        },
        {
            question: "What are your minimum order requirements?",
            answer: "Our minimum order value varies depending on your location and delivery frequency. Typically, we require a minimum order of £100 for standard deliveries. For regular customers with scheduled deliveries, we can offer more flexible terms. Please contact our sales team for customized arrangements."
        },
        {
            question: "How do I place an order?",
            answer: "You can place orders through our online platform, by phone at +44 7477 956299, or by email at info@hksfoods.com. For regular customers, we also offer account management services with dedicated support."
        },
        {
            question: "What payment methods do you accept?",
            answer: "We accept various payment methods including bank transfers, credit/debit cards, and for established customers, we offer account terms with invoicing. Payment terms are typically net 30 days for approved accounts."
        },
        {
            question: "What is your delivery schedule?",
            answer: "We offer flexible delivery schedules to suit your business needs. Standard deliveries are made Monday to Friday, with next-day delivery available for orders placed before 2 PM. We also offer scheduled recurring deliveries for regular customers."
        },
        {
            question: "Do you offer product samples?",
            answer: "Yes, we can provide samples for new customers or for new products you're interested in trying. Contact our sales team to arrange sample delivery."
        },
        {
            question: "What if I receive damaged or incorrect products?",
            answer: "If you receive damaged or incorrect products, please contact us within 24 hours of delivery with photographic evidence. We will arrange for a replacement or credit to your account as appropriate."
        },
        {
            question: "Can I return products?",
            answer: "Due to the nature of food products, we generally cannot accept returns unless the products are damaged, defective, or incorrectly supplied. All return requests must be made within 24 hours of delivery."
        },
        {
            question: "Do you provide product certifications?",
            answer: "Yes, we can provide relevant certifications, allergen information, and product specifications for all our products. These documents are available upon request."
        },
        {
            question: "How can I become a supplier?",
            answer: "We're always interested in working with quality suppliers. Please visit our Trusted Suppliers page or contact us directly with information about your products and company."
        },
        {
            question: "Do you offer bulk discounts?",
            answer: "Yes, we offer competitive pricing for bulk orders and regular customers. Volume discounts are available - contact our sales team to discuss your specific requirements."
        },
        {
            question: "What are your business hours?",
            answer: "Our office is open Monday to Friday, 8:00 AM to 6:00 PM. Orders can be placed 24/7 through our online platform. For urgent inquiries outside business hours, please email us and we'll respond as soon as possible."
        }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
            <PublicNav />

            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
                            <HelpCircle className="h-10 w-10 text-blue-600" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
                        <p className="text-lg text-gray-600">Find answers to common questions about our services</p>
                    </div>

                    {/* FAQ Accordion */}
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
                                <button
                                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                    className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                                >
                                    <span className="text-lg font-semibold text-gray-900">{faq.question}</span>
                                    <ChevronDown
                                        className={`h-5 w-5 text-blue-600 flex-shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''
                                            }`}
                                    />
                                </button>
                                <div
                                    className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-96' : 'max-h-0'
                                        }`}
                                >
                                    <div className="px-6 pb-5 text-gray-700 leading-relaxed border-t border-gray-100 pt-4">
                                        {faq.answer}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Contact Section */}
                    <div className="mt-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-xl p-8 text-center text-white">
                        <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
                        <p className="text-blue-100 mb-6">
                            Our team is here to help. Get in touch with us for personalized assistance.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="/contact"
                                className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                            >
                                Contact Us
                            </a>
                            <a
                                href="mailto:info@hksfoods.com"
                                className="inline-block bg-blue-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-900 transition-colors"
                            >
                                Email Us
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <PublicFooter />
        </div>
    )
}
