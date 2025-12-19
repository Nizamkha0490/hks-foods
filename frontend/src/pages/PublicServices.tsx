import { PublicNav } from "@/components/PublicNav"
import { PublicFooter } from "@/components/PublicFooter"
import { Link } from "react-router-dom"
import { Truck, Package, BarChart3, Clock, Shield, Headphones, ArrowRight, Box } from "lucide-react"
import { Button } from "@/components/ui/button"
import SceneBackground from "@/components/3d/SceneBackground"
import PageTransition from "@/components/Layout/PageTransition"
import { motion } from "framer-motion"

export default function PublicServices() {
    return (
        <PageTransition className="bg-zinc-950 font-sans text-white selection:bg-emerald-500/30">
            <SceneBackground />
            <div className="relative z-10">
                <PublicNav />

                {/* Hero Section */}
                <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden pt-20">
                    <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/20 via-zinc-950/80 to-zinc-950 z-0 pointer-events-none"></div>

                    <div className="container mx-auto px-4 relative z-10 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md text-emerald-400 font-medium text-sm mb-6"
                        >
                            <Shield className="h-4 w-4" />
                            <span>Comprehensive Distribution Solutions</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-7xl font-bold leading-tight mb-6"
                        >
                            Services That Drive <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                                Your Business
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-zinc-400 leading-relaxed max-w-2xl mx-auto"
                        >
                            End-to-end logistics solutions tailored for the precision and speed of the modern food industry.
                        </motion.p>
                    </div>
                </section>

                {/* Services Grid */}
                <section className="py-24 relative">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <ServiceCard
                                icon={<Package className="h-10 w-10 text-emerald-500" />}
                                title="Warehousing & Cold Storage"
                                description="State-of-the-art temperature-controlled facilities ensuring optimal freshness. 24/7 security and real-time inventory tracking."
                                features={["Climate Control", "CCTV Monitoring", "Inventory Management"]}
                                delay={0.1}
                            />
                            <ServiceCard
                                icon={<Truck className="h-10 w-10 text-blue-500" />}
                                title="Nationwide Distribution"
                                description="A reliable, company-owned fleet equipped with GPS tracking and route optimization ensuring timely deliveries across the UK."
                                features={["GPS Tracking", "Route Optimization", "Next-Day Delivery"]}
                                delay={0.2}
                            />
                            <ServiceCard
                                icon={<BarChart3 className="h-10 w-10 text-purple-500" />}
                                title="Supply Chain Analytics"
                                description="Leverage data-driven insights to optimize stock levels, reduce waste, and improve your bottom line with advanced reporting."
                                features={["Real-Time Reports", "Demand Forecasting", "Performance Metrics"]}
                                delay={0.3}
                            />
                            <ServiceCard
                                icon={<Clock className="h-10 w-10 text-orange-500" />}
                                title="Rapid Order Fulfillment"
                                description="Efficient picking, packing, and shipping processes designed for speed and accuracy, ensuring your kitchen never runs out."
                                features={["Fast Processing", "Quality Checks", "Custom Packaging"]}
                                delay={0.4}
                            />
                            <ServiceCard
                                icon={<Shield className="h-10 w-10 text-red-500" />}
                                title="Quality Assurance"
                                description="Rigorous inspection protocols at every stage. We maintain the highest standards of food safety and compliance."
                                features={["HACCP Certified", "Regular Audits", "Full Traceability"]}
                                delay={0.5}
                            />
                            <ServiceCard
                                icon={<Headphones className="h-10 w-10 text-sky-500" />}
                                title="Dedicated Support"
                                description="Your success is our priority. Get paired with a dedicated account manager who understands your business needs."
                                features={["Live Chat", "Phone Support", "24/7 Assistance"]}
                                delay={0.6}
                            />
                        </div>
                    </div>
                </section>

                {/* Benefits / Why Choose Us */}
                <section className="py-32 relative overflow-hidden bg-zinc-900/50 backdrop-blur-sm border-y border-zinc-800">
                    <div className="container mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-16">
                                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Why Choose Our Services</h2>
                                <p className="text-lg text-zinc-400">
                                    Industry-leading solutions backed by years of expertise.
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
                <section className="py-24 relative overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="container mx-auto px-4 text-center relative z-10">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Optimize Your Supply Chain?</h2>
                        <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
                            Let's discuss how our services can transform your distribution operations.
                        </p>
                        <Link to="/contact">
                            <Button size="lg" className="bg-white text-zinc-950 hover:bg-emerald-50 text-lg px-8 py-6 h-auto font-bold rounded-full transition-transform hover:-translate-y-1">
                                Get Started
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                    </div>
                </section>

                <PublicFooter />
            </div>
        </PageTransition>
    )
}

function ServiceCard({ icon, title, description, features, delay }: {
    icon: React.ReactNode
    title: string
    description: string
    features: string[]
    delay: number
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-zinc-900/40 backdrop-blur-md p-8 rounded-2xl border border-zinc-800 hover:bg-zinc-800/60 hover:border-emerald-500/30 transition-all duration-300 group"
        >
            <div className="mb-6 p-4 bg-zinc-950 rounded-xl border border-zinc-800 w-fit group-hover:scale-110 transition-transform duration-300 shadow-lg">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">{title}</h3>
            <p className="text-zinc-400 leading-relaxed mb-6 h-20">{description}</p>
            <div className="border-t border-zinc-800 pt-4">
                <ul className="space-y-3">
                    {features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-zinc-300 font-medium">
                            <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full"></div>
                            {feature}
                        </li>
                    ))}
                </ul>
            </div>
        </motion.div>
    )
}

function BenefitCard({ title, description }: { title: string, description: string }) {
    return (
        <div className="bg-zinc-900/30 backdrop-blur-sm p-6 rounded-xl border border-zinc-800 hover:border-blue-500/30 transition-colors">
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-zinc-400">{description}</p>
        </div>
    )
}
