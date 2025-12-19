import { PublicNav } from "@/components/PublicNav"
import { PublicFooter } from "@/components/PublicFooter"
import { Link } from "react-router-dom"
import { Package, Truck, BarChart3, ArrowRight, ShieldCheck, Clock, CheckCircle2, Leaf, Box } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HeroCarousel } from "@/components/HeroCarousel"
import SceneBackground from "@/components/3d/SceneBackground"
// import PageTransition from "@/components/Layout/PageTransition"
import { motion } from "framer-motion"

export default function PublicLanding() {
    return (
        <div className="bg-zinc-950 font-sans text-white selection:bg-emerald-500/30">
            <SceneBackground />

            <div className="relative z-10">
                <PublicNav />

                {/* Hero Section */}
                <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
                    <div className="absolute inset-0 z-0">
                        {/* Overlay gradient to blend carousel with dark theme */}
                        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-zinc-950/50 to-zinc-950 z-10"></div>
                        <HeroCarousel />
                    </div>

                    <div className="container mx-auto px-4 relative z-20">
                        <div className="max-w-4xl mx-auto text-center space-y-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md text-emerald-400 font-medium text-sm"
                            >
                                <ShieldCheck className="h-4 w-4" />
                                <span>Premium Food Distribution Partner</span>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight tracking-tight text-white mb-6"
                            >
                                The Future of <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                                    Food Logistics
                                </span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="text-xl md:text-2xl text-zinc-400 leading-relaxed max-w-2xl mx-auto"
                            >
                                Enterprise-grade supply chain solutions. Delivering precision, quality, and reliability to the UK's leading food businesses.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="flex flex-col sm:flex-row justify-center gap-4 pt-8"
                            >
                                <Link to="/contact">
                                    <Button size="lg" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-lg px-8 py-7 h-auto shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)] transition-all hover:scale-105 border-0">
                                        Partner With Us
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                                <Link to="/services">
                                    <Button size="lg" variant="outline" className="w-full sm:w-auto border-zinc-700 text-zinc-300 hover:bg-white/5 hover:text-white text-lg px-8 py-7 h-auto">
                                        Our Services
                                    </Button>
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Stats / Trust Strip */}
                <div className="border-y border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-zinc-800/50">
                            <StatItem number="24/7" label="Logistics Support" />
                            <StatItem number="99.8%" label="On-Time Delivery" />
                            <StatItem number="500+" label="Premium Products" />
                            <StatItem number="Nationwide" label="Distribution Network" />
                        </div>
                    </div>
                </div>

                {/* Featured Products Section */}
                <section className="py-24 relative overflow-hidden">
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 font-medium text-sm mb-4 border border-blue-500/20">
                                <Package className="h-4 w-4" />
                                <span>Our Selection</span>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Premium Product Portfolio</h2>
                            <p className="text-lg text-zinc-400">
                                Sourcing the finest ingredients. Expertly handled. Delivered fresh.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Poultry */}
                            <ProductCard
                                image="/assets/raw_chicken_8_cut_1766096875108.png"
                                title="Whole Chicken 8-Cut"
                                category="Poultry"
                            />
                            <ProductCard
                                image="/assets/raw_chicken_prime_neblets_1766096785604.png"
                                title="Prime Chicken Niblets"
                                category="Poultry"
                            />
                            <ProductCard
                                image="/assets/raw_chicken_inner_fillets_1766096802193.png"
                                title="Premium Inner Fillets"
                                category="Poultry"
                            />
                            <ProductCard
                                image="/assets/raw_chicken_flat_wings_1766096818693.png"
                                title="Fresh Flat Wings"
                                category="Poultry"
                            />
                            <ProductCard
                                image="/assets/raw_chicken_inner_plate_6_cut_1766096857023.png"
                                title="Inner Plate 6-Cut"
                                category="Poultry"
                            />
                            <ProductCard
                                image="/assets/chicken_tikka_raw_marinated_1766097037918.png"
                                title="Marinated Chicken Tikka"
                                category="Ready to Cook"
                            />

                            {/* Meat */}
                            <ProductCard
                                image="/assets/fakir_donner_meat_1766096947697.png"
                                title="Fakir Donner Meat"
                                category="Frozen Meat"
                            />
                            <ProductCard
                                image="/assets/khyber_donner_meat_1766096964719.png"
                                title="Khyber Donner Meat"
                                category="Frozen Meat"
                            />
                            <ProductCard
                                image="/assets/seekh_kabab_frozen_stack_1766097021267.png"
                                title="Frozen Seekh Kebabs"
                                category="Frozen Meat"
                            />
                            <ProductCard
                                image="/assets/shami_kabab_raw_1766096982075.png"
                                title="Traditional Shami Kebabs"
                                category="Frozen Meat"
                            />

                            {/* Drinks */}
                            <ProductCard
                                image="/assets/pepsi_bottle_group_1766096889689.png"
                                title="Pepsi Range"
                                category="Beverages"
                            />
                            <ProductCard
                                image="/assets/coke_can_group_1766096930158.png"
                                title="Coca-Cola Cans"
                                category="Beverages"
                            />
                        </div>
                    </div>
                </section>

                {/* Capabilities / Glassmorphism Grid */}
                <section className="py-24 relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-900/50 to-transparent pointer-events-none"></div>
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1 space-y-8">
                                <h2 className="text-4xl font-bold text-white leading-tight">
                                    Enterprise <br />
                                    <span className="text-emerald-400">Capabilities</span>
                                </h2>
                                <p className="text-zinc-400 text-lg leading-relaxed">
                                    Built for high-volume distribution centers requiring precision, speed, and real-time reliability.
                                </p>
                                <Button className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700">
                                    Explore Services
                                </Button>
                            </div>
                            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <CapabilityCard
                                    icon={<Box className="h-8 w-8 text-blue-400" />}
                                    title="Smart Inventory"
                                    description="Real-time stock tracking with predictive analytics to prevent stockouts."
                                />
                                <CapabilityCard
                                    icon={<Truck className="h-8 w-8 text-emerald-400" />}
                                    title="Cold Chain Logistics"
                                    description="Temperature-controlled fleet ensuring optimal freshness from warehouse to door."
                                />
                                <CapabilityCard
                                    icon={<BarChart3 className="h-8 w-8 text-purple-400" />}
                                    title="Data Analytics"
                                    description="Comprehensive financial reporting and market insights to drive your growth."
                                />
                                <CapabilityCard
                                    icon={<ShieldCheck className="h-8 w-8 text-orange-400" />}
                                    title="Quality Assurance"
                                    description="Rigorous 20-point inspection process for every shipment received and dispatched."
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-32 relative overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="container mx-auto px-4 text-center relative z-10">
                        <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight">
                            Ready to Upgrade Your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                                Supply Chain?
                            </span>
                        </h2>
                        <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto">
                            Join hundreds of satisfied partners who trust HKS Foods for their distribution needs. Experience the difference of a true logistics partner.
                        </p>
                        <Link to="/contact">
                            <Button size="lg" className="bg-white text-zinc-950 hover:bg-emerald-50 text-xl px-12 py-8 h-auto font-bold rounded-full shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-10px_rgba(255,255,255,0.4)] transition-all transform hover:-translate-y-1">
                                Get Started Now
                            </Button>
                        </Link>
                    </div>
                </section>

                <PublicFooter />
            </div>
        </div>
    )
}

function StatItem({ number, label }: { number: string, label: string }) {
    return (
        <div className="py-8 text-center group hover:bg-white/5 transition-colors cursor-default">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">{number}</div>
            <div className="text-sm text-zinc-500 uppercase tracking-widest font-medium group-hover:text-emerald-400 transition-colors">{label}</div>
        </div>
    )
}

function ProductCard({ image, title, category }: { image: string, title: string, category: string }) {
    return (
        <motion.div
            whileHover={{ y: -10 }}
            className="bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-zinc-800 overflow-hidden hover:border-emerald-500/30 hover:shadow-[0_0_30px_-10px_rgba(16,185,129,0.2)] transition-all group"
        >
            <div className="h-64 overflow-hidden relative p-4 flex items-center justify-center bg-zinc-900">
                {/* Radial Gradient Background for Product */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800/50 to-zinc-950/0 z-0"></div>
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-contain relative z-10 transform group-hover:scale-110 transition-transform duration-500 drop-shadow-2xl"
                />
            </div>
            <div className="p-6 border-t border-zinc-800/50 bg-zinc-900/80">
                <div className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-2">{category}</div>
                <h3 className="font-bold text-white text-lg group-hover:text-emerald-400 transition-colors">{title}</h3>
            </div>
        </motion.div>
    )
}

function CapabilityCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="bg-zinc-900/40 backdrop-blur-md p-8 rounded-2xl border border-zinc-800 hover:bg-zinc-800/60 hover:border-zinc-700 transition-all duration-300 group">
            <div className="mb-6 p-4 bg-zinc-950 rounded-xl border border-zinc-800 w-fit group-hover:scale-110 transition-transform duration-300 shadow-lg">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">{title}</h3>
            <p className="text-zinc-400 leading-relaxed text-sm">
                {description}
            </p>
        </div>
    )
}
