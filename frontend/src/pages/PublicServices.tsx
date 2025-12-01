import { PublicNav } from "@/components/PublicNav"
import { PublicFooter } from "@/components/PublicFooter"
import { Link } from "react-router-dom"
import { Truck, Package, BarChart3, Clock, Shield, Headphones, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PublicServices() {
    return (
        <div className="min-h-screen bg-white">
            <PublicNav />

            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white py-24 overflow-hidden">
                <div className="absolute inset-0 bg-[url('/assets/hero-bg.png')] opacity-10 bg-cover bg-center"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in-up">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-blue-100 font-medium text-sm">
                            <Shield className="h-4 w-4" />
                            <span>Comprehensive Distribution Solutions</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                            Services That Drive Your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">
                                Business Forward
                            </span>
                        </h1>
                        <p className="text-xl text-blue-100 leading-relaxed">
                            From warehousing to last-mile delivery, we provide end-to-end logistics solutions tailored to the food industry.
                        </p>
                    </div>
                </div>
            </section>

            {/* Services Grid */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Core Services</h2>
                        <p className="text-lg text-gray-600">
                            Comprehensive solutions designed for the modern food distribution industry
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <ServiceCard
                            icon={<Package className="h-12 w-12 text-blue-600" />}
                            title="Warehousing & Storage"
                            description="State-of-the-art temperature-controlled facilities with 24/7 security and real-time inventory tracking."
                            features={["Climate Control", "CCTV Monitoring", "Inventory Management"]}
                        />
                        <ServiceCard
                            icon={<Truck className="h-12 w-12 text-indigo-600" />}
                            title="Distribution & Delivery"
                            description="Reliable fleet management with optimized routing for on-time delivery across the UK."
                            features={["GPS Tracking", "Route Optimization", "Same-Day Delivery"]}
                        />
                        <ServiceCard
                            icon={<BarChart3 className="h-12 w-12 text-purple-600" />}
                            title="Supply Chain Analytics"
                            description="Data-driven insights to optimize your operations and reduce costs."
                            features={["Real-Time Reports", "Demand Forecasting", "Performance Metrics"]}
                        />
                        <ServiceCard
                            icon={<Clock className="h-12 w-12 text-green-600" />}
                            title="Order Fulfillment"
                            description="Efficient picking, packing, and shipping services to meet your deadlines."
                            features={["Fast Processing", "Quality Control", "Custom Packaging"]}
                        />
                        <ServiceCard
                            icon={<Shield className="h-12 w-12 text-red-600" />}
                            title="Quality Assurance"
                            description="Rigorous inspection processes ensuring product safety and compliance."
                            features={["HACCP Certified", "Regular Audits", "Traceability"]}
                        />
                        <ServiceCard
                            icon={<Headphones className="h-12 w-12 text-orange-600" />}
                            title="24/7 Support"
                            description="Dedicated account managers and round-the-clock customer service."
                            features={["Live Chat", "Phone Support", "Email Assistance"]}
                        />
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-24 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose Our Services</h2>
                            <p className="text-lg text-gray-600">
                                Industry-leading solutions backed by years of expertise
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <BenefitCard
                                title="Cost Efficiency"
                                description="Reduce operational costs by up to 30% with our optimized logistics network and bulk handling capabilities."
                            />
                            <BenefitCard
                                title="Scalability"
                                description="Grow your business without worrying about infrastructure. Our flexible solutions scale with your needs."
                            />
                            <BenefitCard
                                title="Compliance"
                                description="Full adherence to UK food safety regulations, HACCP standards, and industry best practices."
                            />
                            <BenefitCard
                                title="Technology Integration"
                                description="Seamless API integration with your existing systems for real-time data synchronization."
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Optimize Your Supply Chain?</h2>
                    <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                        Let's discuss how our services can transform your distribution operations.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link to="/contact">
                            <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 text-lg px-8 py-6 h-auto font-bold">
                                Get Started
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link to="/product-inventory">
                            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8 py-6 h-auto">
                                View Products
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            <PublicFooter />
        </div>
    )
}

function ServiceCard({ icon, title, description, features }: {
    icon: React.ReactNode
    title: string
    description: string
    features: string[]
}) {
    return (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
            <div className="mb-6 p-4 bg-blue-50 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
            <p className="text-gray-600 leading-relaxed mb-4">{description}</p>
            <ul className="space-y-2">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="h-1.5 w-1.5 bg-blue-600 rounded-full"></div>
                        {feature}
                    </li>
                ))}
            </ul>
        </div>
    )
}

function BenefitCard({ title, description }: { title: string, description: string }) {
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
        </div>
    )
}
