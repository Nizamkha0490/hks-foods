import { PublicNav } from "@/components/PublicNav"
import { PublicFooter } from "@/components/PublicFooter"
import { Link } from "react-router-dom"
import { Users, Globe, Award, TrendingUp, CheckCircle2, ArrowRight, Handshake, Clock, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import SceneBackground from "@/components/3d/SceneBackground"
import PageTransition from "@/components/Layout/PageTransition"
import { motion } from "framer-motion"

export default function PublicSuppliers() {
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
                            <Handshake className="h-4 w-4" />
                            <span>Building Long-Term Partnerships</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-6"
                        >
                            Partner With a <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                                Trusted Distributor
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-zinc-400 leading-relaxed max-w-2xl mx-auto"
                        >
                            Join our network of premium suppliers and expand your reach across the UK food industry with a partner that values quality, innovation, and reliability.
                        </motion.p>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-16 border-y border-zinc-800 bg-zinc-900/40 backdrop-blur-sm">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
                            <StatCard icon={<Users className="h-6 w-6" />} value="500+" label="Active Suppliers" delay={0.1} />
                            <StatCard icon={<Globe className="h-6 w-6" />} value="25+" label="Countries Sourced" delay={0.2} />
                            <StatCard icon={<Award className="h-6 w-6" />} value="100%" label="Quality Certified" delay={0.3} />
                            <StatCard icon={<TrendingUp className="h-6 w-6" />} value="15+" label="Years Excellence" delay={0.4} />
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="py-24 relative">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-20">
                                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Why Suppliers Choose Us</h2>
                                <p className="text-lg text-zinc-400">
                                    We provide the platform and support you need to scale your distribution.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <BenefitCard
                                    icon={<DollarSign className="h-6 w-6 text-emerald-400" />}
                                    title="Fair Pricing"
                                    description="Competitive rates and transparent pricing structures that benefit both parties. We believe in mutual growth."
                                    delay={0.1}
                                />
                                <BenefitCard
                                    icon={<Clock className="h-6 w-6 text-blue-400" />}
                                    title="Timely Payments"
                                    description="Reliable payment schedules ensuring smooth cash flow for our partners. No chasing invoices."
                                    delay={0.2}
                                />
                                <BenefitCard
                                    icon={<Handshake className="h-6 w-6 text-purple-400" />}
                                    title="Long-term Partnerships"
                                    description="We view our suppliers as strategic partners, not just vendors. We build relationships that last."
                                    delay={0.3}
                                />
                                <BenefitCard
                                    icon={<TrendingUp className="h-6 w-6 text-orange-400" />}
                                    title="Growth Opportunities"
                                    description="Access to expanding markets and increasing order volumes through our growing distribution network."
                                    delay={0.4}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Partnership Process */}
                <section className="py-24 bg-zinc-900/30">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-20">
                                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">How to Become a Supplier</h2>
                                <p className="text-lg text-zinc-400">
                                    A streamedlined 4-step process to join our network.
                                </p>
                            </div>

                            <div className="space-y-12">
                                <ProcessStep
                                    number="01"
                                    title="Initial Contact"
                                    description="Reach out to us through our contact form or email. Tell us about your products and capabilities."
                                />
                                <ProcessStep
                                    number="02"
                                    title="Qualification Review"
                                    description="Our team reviews your application, verifies certifications (HACCP, BRC), and assesses product quality."
                                />
                                <ProcessStep
                                    number="03"
                                    title="Agreement & Onboarding"
                                    description="We finalize terms, set up your account in our digital portal, and integrate you into our supply chain."
                                />
                                <ProcessStep
                                    number="04"
                                    title="Start Supplying"
                                    description="Begin receiving Purchase Orders and delivering products to our distribution centers."
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Requirements Section */}
                <section className="py-24 relative overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-3xl mx-auto">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Supplier Requirements</h2>
                                <p className="text-zinc-400 text-lg">
                                    To ensure enterprise-grade quality, we require:
                                </p>
                            </div>

                            <div className="bg-zinc-900/60 p-10 rounded-3xl border border-zinc-800 backdrop-blur-md shadow-2xl">
                                <ul className="space-y-6">
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
                <section className="py-32 relative text-center">
                    <div className="container mx-auto px-4 relative z-10">
                        <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">Ready to Partner With Us?</h2>
                        <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto">
                            Join hundreds of suppliers who trust HKS Foods as their distribution partner.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-6">
                            <Link to="/contact">
                                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white text-lg px-12 py-8 h-auto font-bold rounded-full shadow-lg shadow-emerald-900/20 transition-transform hover:-translate-y-1">
                                    Apply Now
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link to="/services">
                                <Button size="lg" variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white text-lg px-12 py-8 h-auto rounded-full">
                                    Learn More
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>

                <PublicFooter />
            </div>
        </PageTransition>
    )
}

function StatCard({ icon, value, label, delay }: { icon: React.ReactNode, value: string, label: string, delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:bg-zinc-800/80 transition-all duration-300 hover:-translate-y-1 group"
        >
            <div className="flex justify-center mb-4 text-emerald-500 group-hover:scale-110 transition-transform">{icon}</div>
            <div className="text-3xl font-bold text-white mb-2">{value}</div>
            <div className="text-zinc-500 text-sm font-medium tracking-wide">{label}</div>
        </motion.div>
    )
}

function BenefitCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay, duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-8 hover:bg-zinc-800/60 hover:border-zinc-700 transition-all duration-300"
        >
            <div className="flex items-start gap-6">
                <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800">{icon}</div>
                <div>
                    <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                    <p className="text-zinc-400 leading-relaxed">{description}</p>
                </div>
            </div>
        </motion.div>
    )
}

function ProcessStep({ number, title, description }: { number: string, title: string, description: string }) {
    return (
        <div className="flex gap-8 group">
            <div className="flex-shrink-0">
                <div className="h-14 w-14 bg-zinc-900 border border-zinc-700 rounded-full flex items-center justify-center text-emerald-500 font-bold text-xl shadow-lg group-hover:border-emerald-500 transition-colors">
                    {number}
                </div>
            </div>
            <div className="flex-1 pt-2">
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">{title}</h3>
                <p className="text-zinc-400 leading-relaxed text-lg">{description}</p>
            </div>
        </div>
    )
}

function RequirementItem({ text }: { text: string }) {
    return (
        <li className="flex items-start gap-4">
            <CheckCircle2 className="h-6 w-6 text-emerald-500 flex-shrink-0 mt-0.5" />
            <span className="text-zinc-300 text-lg">{text}</span>
        </li>
    )
}
