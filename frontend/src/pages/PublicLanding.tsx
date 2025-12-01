import { PublicNav } from "@/components/PublicNav"
import { PublicFooter } from "@/components/PublicFooter"
import { Link } from "react-router-dom"
import { Package, Truck, BarChart3, CheckCircle2, ArrowRight, ShieldCheck, Clock, Leaf } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HeroCarousel } from "@/components/HeroCarousel"

export default function PublicLanding() {
    return (
        <div className="min-h-screen bg-white font-sans">
            <PublicNav />

            {/* Hero Section */}
            <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
                {/* Carousel Background */}
                <HeroCarousel />

                {/* Content */}
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl text-white space-y-8 animate-fade-in-up">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/20 border border-blue-400/30 backdrop-blur-sm text-blue-100 font-medium text-sm">
                            <ShieldCheck className="h-4 w-4" />
                            <span>Premium Food Distribution Partner</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight">
                            Elevating Supply Chain <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                                Excellence
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl text-gray-200 leading-relaxed max-w-2xl">
                            HKS Foods delivers enterprise-grade logistics, premium inventory management, and reliable distribution for the modern food industry.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Link to="/product-inventory">
                                <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6 h-auto shadow-lg shadow-blue-600/20">
                                    Browse Inventory
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link to="/contact">
                                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/10 text-lg px-8 py-6 h-auto backdrop-blur-sm">
                                    Partner With Us
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* About / Fresh Produce Section */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="relative order-2 lg:order-1">
                            <div className="absolute -inset-4 bg-gradient-to-br from-green-100 to-blue-50 rounded-3xl -z-10 transform -rotate-2"></div>
                            <img
                                src="/assets/food-warehouse.png"
                                alt="Modern Food Warehouse Facility"
                                className="rounded-2xl shadow-2xl w-full object-cover h-[600px] transform hover:scale-[1.02] transition-transform duration-500"
                            />
                            <div className="absolute bottom-8 left-8 bg-white/95 backdrop-blur p-6 rounded-xl shadow-lg border border-gray-100 max-w-xs">
                                <div className="flex items-center gap-3 mb-2">
                                    <Leaf className="h-6 w-6 text-green-600" />
                                    <span className="font-bold text-gray-900">State-of-the-Art Facility</span>
                                </div>
                                <p className="text-sm text-gray-600">Temperature-controlled warehouse ensuring optimal storage conditions.</p>
                            </div>
                        </div>

                        <div className="space-y-8 order-1 lg:order-2">
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                                Quality That Defines <br />
                                <span className="text-blue-600">Your Business</span>
                            </h2>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                At HKS Foods, we understand that the quality of your ingredients defines the success of your business. That's why we've built a rigorous supply chain that prioritizes freshness, safety, and consistency above all else.
                            </p>

                            <div className="space-y-4">
                                <FeatureRow icon={<CheckCircle2 className="text-green-600" />} title="Strict Quality Control" text="Every shipment undergoes a 20-point inspection process." />
                                <FeatureRow icon={<CheckCircle2 className="text-green-600" />} title="Temperature Controlled" text="End-to-end cold chain management for sensitive goods." />
                                <FeatureRow icon={<CheckCircle2 className="text-green-600" />} title="Sustainable Sourcing" text="Partnering with eco-conscious suppliers worldwide." />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Capabilities Grid */}
            <section className="py-24 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Enterprise Capabilities</h2>
                        <p className="text-lg text-gray-600">
                            Built for high-volume distribution centers requiring precision, speed, and reliability.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <CapabilityCard
                            icon={<Package className="h-10 w-10 text-blue-600" />}
                            title="Smart Inventory"
                            description="Real-time stock tracking with predictive analytics to prevent stockouts and minimize waste."
                        />
                        <CapabilityCard
                            icon={<Truck className="h-10 w-10 text-indigo-600" />}
                            title="Global Logistics"
                            description="Optimized routing and fleet management ensuring on-time delivery across the UK."
                        />
                        <CapabilityCard
                            icon={<BarChart3 className="h-10 w-10 text-purple-600" />}
                            title="Data Analytics"
                            description="Comprehensive financial reporting and market insights to drive your growth."
                        />
                    </div>
                </div>
            </section>

            {/* Logistics / Fleet Section */}
            <section className="py-24 bg-white overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-medium text-sm">
                                <Clock className="h-4 w-4" />
                                <span>Reliable Distribution Network</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                                Delivered On Time, <br />
                                <span className="text-indigo-600">Every Time</span>
                            </h2>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                Our modern fleet and advanced logistics platform ensure that your orders arrive exactly when you need them. We leverage route optimization technology to maximize efficiency and reduce our carbon footprint.
                            </p>
                            <div className="grid grid-cols-2 gap-6 pt-4">
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="text-3xl font-bold text-indigo-600 mb-1">99.8%</div>
                                    <div className="text-sm text-gray-600 font-medium">On-Time Delivery</div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="text-3xl font-bold text-indigo-600 mb-1">24/7</div>
                                    <div className="text-sm text-gray-600 font-medium">Logistics Support</div>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute -inset-4 bg-gradient-to-bl from-indigo-100 to-blue-50 rounded-3xl -z-10 transform rotate-2"></div>
                            <img
                                src="/assets/delivery-fleet.png"
                                alt="Modern Delivery Fleet"
                                className="rounded-2xl shadow-2xl w-full object-cover h-[500px] transform hover:scale-[1.02] transition-transform duration-500"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-gradient-to-r from-blue-900 to-indigo-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/assets/hero-bg.png')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                        Ready to Transform Your Supply Chain?
                    </h2>
                    <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                        Join hundreds of satisfied partners who trust HKS Foods for their distribution needs.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link to="/contact">
                            <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 text-lg px-8 py-6 h-auto font-bold">
                                Get Started Now
                            </Button>
                        </Link>
                        <Link to="/product-inventory">
                            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8 py-6 h-auto">
                                View Catalog
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            <PublicFooter />
        </div>
    )
}

function FeatureRow({ icon, title, text }: { icon: React.ReactNode, title: string, text: string }) {
    return (
        <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="mt-1 bg-green-50 p-2 rounded-lg">{icon}</div>
            <div>
                <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
                <p className="text-gray-600 text-sm">{text}</p>
            </div>
        </div>
    )
}

function CapabilityCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
            <div className="mb-6 p-4 bg-blue-50 rounded-2xl w-fit group-hover:bg-blue-600 group-hover:text-white transition-colors">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
            <p className="text-gray-600 leading-relaxed">
                {description}
            </p>
        </div>
    )
}
