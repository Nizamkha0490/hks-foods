import { PublicNav } from "@/components/PublicNav"
import { PublicFooter } from "@/components/PublicFooter"
import { Link } from "react-router-dom"
import { Users, Globe, Award, TrendingUp, CheckCircle2, ArrowRight, Handshake, Clock, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PublicSuppliers() {
    return (
        <div className="min-h-screen bg-white">
            <PublicNav />

            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 text-white py-24 overflow-hidden">
                <div className="absolute inset-0 bg-[url('/assets/fresh-produce.png')] opacity-10 bg-cover bg-center"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in-up">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-green-100 font-medium text-sm">
                            <Handshake className="h-4 w-4" />
                            <span>Building Long-Term Partnerships</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                            Partner With a <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-300">
                                Trusted Distributor
                            </span>
                        </h1>
                        <p className="text-xl text-green-100 leading-relaxed">
                            Join our network of premium suppliers and expand your reach across the UK food industry.
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-white border-b border-gray-100">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
                        <StatCard icon={<Users className="h-8 w-8" />} value="500+" label="Active Suppliers" />
                        <StatCard icon={<Globe className="h-8 w-8" />} value="25+" label="Countries" />
                        <StatCard icon={<Award className="h-8 w-8" />} value="100%" label="Quality Certified" />
                        <StatCard icon={<TrendingUp className="h-8 w-8" />} value="15+" label="Years Experience" />
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-24 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Suppliers Choose Us</h2>
                            <p className="text-lg text-gray-600">
                                We provide the platform and support you need to grow your business
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <BenefitCard
                                icon={<DollarSign className="h-6 w-6 text-green-600" />}
                                title="Fair Pricing"
                                description="Competitive rates and transparent pricing structures that benefit both parties."
                            />
                            <BenefitCard
                                icon={<Clock className="h-6 w-6 text-blue-600" />}
                                title="Timely Payments"
                                description="Reliable payment schedules ensuring smooth cash flow for our partners."
                            />
                            <BenefitCard
                                icon={<Handshake className="h-6 w-6 text-purple-600" />}
                                title="Long-term Partnerships"
                                description="We believe in building lasting relationships with our supplier network."
                            />
                            <BenefitCard
                                icon={<TrendingUp className="h-6 w-6 text-orange-600" />}
                                title="Growth Opportunities"
                                description="Access to expanding markets and increasing order volumes."
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Partnership Process */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How to Become a Supplier</h2>
                            <p className="text-lg text-gray-600">
                                A simple 4-step process to join our network
                            </p>
                        </div>

                        <div className="space-y-8">
                            <ProcessStep
                                number="1"
                                title="Initial Contact"
                                description="Reach out to us through our contact form or email. Tell us about your products and capabilities."
                            />
                            <ProcessStep
                                number="2"
                                title="Qualification Review"
                                description="Our team reviews your application, verifies certifications, and assesses product quality."
                            />
                            <ProcessStep
                                number="3"
                                title="Agreement & Onboarding"
                                description="We finalize terms, set up your account, and integrate you into our system."
                            />
                            <ProcessStep
                                number="4"
                                title="Start Supplying"
                                description="Begin receiving orders and delivering products to our distribution network."
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Requirements Section */}
            <section className="py-24 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Supplier Requirements</h2>
                            <p className="text-lg text-gray-600">
                                To ensure quality and compliance, we require:
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                            <ul className="space-y-4">
                                <RequirementItem text="Valid food safety certifications (HACCP, BRC, or equivalent)" />
                                <RequirementItem text="Proven track record of quality and reliability" />
                                <RequirementItem text="Ability to meet volume and delivery requirements" />
                                <RequirementItem text="Comprehensive product liability insurance" />
                                <RequirementItem text="Commitment to sustainable and ethical practices" />
                                <RequirementItem text="Transparent supply chain documentation" />
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-gradient-to-r from-green-900 to-emerald-900 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Partner With Us?</h2>
                    <p className="text-xl text-green-100 mb-10 max-w-2xl mx-auto">
                        Join hundreds of suppliers who trust HKS Foods as their distribution partner.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link to="/contact">
                            <Button size="lg" className="bg-white text-green-900 hover:bg-green-50 text-lg px-8 py-6 h-auto font-bold">
                                Apply Now
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link to="/services">
                            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8 py-6 h-auto">
                                Learn More
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            <PublicFooter />
        </div>
    )
}

function StatCard({ icon, value, label }: { icon: React.ReactNode, value: string, label: string }) {
    return (
        <div className="text-center p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
            <div className="flex justify-center mb-3 text-blue-600">{icon}</div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
            <div className="text-gray-600 text-sm">{label}</div>
        </div>
    )
}

function BenefitCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
                <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                    <p className="text-gray-600">{description}</p>
                </div>
            </div>
        </div>
    )
}

function ProcessStep({ number, title, description }: { number: string, title: string, description: string }) {
    return (
        <div className="flex gap-6">
            <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {number}
                </div>
            </div>
            <div className="flex-1 pt-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600">{description}</p>
            </div>
        </div>
    )
}

function RequirementItem({ text }: { text: string }) {
    return (
        <li className="flex items-start gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700">{text}</span>
        </li>
    )
}
