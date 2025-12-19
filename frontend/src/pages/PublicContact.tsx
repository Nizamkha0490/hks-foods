import { PublicNav } from "@/components/PublicNav"
import { PublicFooter } from "@/components/PublicFooter"
import { Mail, Phone, MapPin, Clock, Send, Building2, Home, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { toast } from "sonner"
import api from "../utils/api"
import SceneBackground from "@/components/3d/SceneBackground"
import PageTransition from "@/components/Layout/PageTransition"
import { motion } from "framer-motion"

export default function PublicContact() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        company: "",
        street: "",
        city: "",
        postalCode: "",
        message: ""
    })
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name || !formData.email || !formData.message) {
            toast.error("Please fill in all required fields")
            return
        }

        try {
            setSubmitting(true)
            await api.post("/contact", formData)
            toast.success("Message sent successfully! We'll get back to you soon.")
            // Reset form
            setFormData({
                name: "",
                email: "",
                phone: "",
                company: "",
                street: "",
                city: "",
                postalCode: "",
                message: ""
            })
        } catch (error: any) {
            console.error("Error sending message:", error)
            toast.error(error.response?.data?.message || "Failed to send message. Please try again.")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <PageTransition className="bg-zinc-950 font-sans text-white selection:bg-emerald-500/30">
            <SceneBackground />
            <div className="relative z-10">
                <PublicNav />

                {/* Hero Section */}
                <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden pt-20">
                    <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/20 via-zinc-950/80 to-zinc-950 z-0 pointer-events-none"></div>
                    <div className="container mx-auto px-4 relative z-10 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-md text-blue-400 font-medium text-sm mb-6"
                        >
                            <MessageSquare className="h-4 w-4" />
                            <span>Business Enquiries</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-6"
                        >
                            Let's Discuss <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                                Your Supply Needs
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-zinc-400 leading-relaxed max-w-2xl mx-auto"
                        >
                            Our team is ready to provide you with tailored pricing and logistics solutions.
                        </motion.p>
                    </div>
                </section>

                {/* Contact Section */}
                <section className="py-24 relative">
                    <div className="container mx-auto px-4">
                        <div className="max-w-6xl mx-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
                                {/* Contact Form */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <h2 className="text-3xl font-bold text-white mb-8">Send Us a Message</h2>
                                    <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-900/40 backdrop-blur-md p-8 rounded-3xl border border-zinc-800">
                                        {/* Name */}
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-sm font-medium text-zinc-300">Full Name *</Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="bg-zinc-950/50 border-zinc-800 text-white focus:border-blue-500/50 h-12"
                                                placeholder="John Doe"
                                            />
                                        </div>

                                        {/* Email */}
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-sm font-medium text-zinc-300">Email Address *</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="bg-zinc-950/50 border-zinc-800 text-white focus:border-blue-500/50 h-12"
                                                placeholder="john@example.com"
                                            />
                                        </div>

                                        {/* Phone and Company Row */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="phone" className="text-sm font-medium text-zinc-300">Phone Number</Label>
                                                <Input
                                                    id="phone"
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    className="bg-zinc-950/50 border-zinc-800 text-white focus:border-blue-500/50 h-12"
                                                    placeholder="+44 7477 956299"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="company" className="text-sm font-medium text-zinc-300">Company Name</Label>
                                                <Input
                                                    id="company"
                                                    type="text"
                                                    value={formData.company}
                                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                                    className="bg-zinc-950/50 border-zinc-800 text-white focus:border-blue-500/50 h-12"
                                                    placeholder="Your Company Ltd"
                                                />
                                            </div>
                                        </div>

                                        {/* Address Section */}
                                        <div className="border-t border-zinc-800 pt-6">
                                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                                <Home className="h-5 w-5 text-blue-500" />
                                                Address (Optional)
                                            </h3>

                                            {/* Street */}
                                            <div className="mb-4 space-y-2">
                                                <Label htmlFor="street" className="text-sm font-medium text-zinc-300">Street Address</Label>
                                                <Input
                                                    id="street"
                                                    type="text"
                                                    value={formData.street}
                                                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                                                    className="bg-zinc-950/50 border-zinc-800 text-white focus:border-blue-500/50 h-12"
                                                    placeholder="123 Main Street"
                                                />
                                            </div>

                                            {/* City and Postal Code Row */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="city" className="text-sm font-medium text-zinc-300">City</Label>
                                                    <Input
                                                        id="city"
                                                        type="text"
                                                        value={formData.city}
                                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                        className="bg-zinc-950/50 border-zinc-800 text-white focus:border-blue-500/50 h-12"
                                                        placeholder="Birmingham"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="postalCode" className="text-sm font-medium text-zinc-300">Postal Code</Label>
                                                    <Input
                                                        id="postalCode"
                                                        type="text"
                                                        value={formData.postalCode}
                                                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                                                        className="bg-zinc-950/50 border-zinc-800 text-white focus:border-blue-500/50 h-12"
                                                        placeholder="B8 3AA"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Message */}
                                        <div className="space-y-2">
                                            <Label htmlFor="message" className="text-sm font-medium text-zinc-300">Message *</Label>
                                            <Textarea
                                                id="message"
                                                required
                                                value={formData.message}
                                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                rows={6}
                                                className="bg-zinc-950/50 border-zinc-800 text-white focus:border-blue-500/50 resize-none min-h-[150px]"
                                                placeholder="Tell us how we can help..."
                                            />
                                        </div>

                                        {/* Submit Button */}
                                        <Button
                                            type="submit"
                                            size="lg"
                                            className="w-full bg-blue-600 hover:bg-blue-500 text-white text-lg py-6 min-h-[56px] rounded-xl font-bold shadow-lg shadow-blue-900/20"
                                            disabled={submitting}
                                        >
                                            {submitting ? "Sending..." : "Send Message"}
                                            {!submitting && <Send className="ml-2 h-5 w-5" />}
                                        </Button>
                                    </form>
                                </motion.div>

                                {/* Contact Information */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="space-y-12"
                                >
                                    <div>
                                        <h2 className="text-3xl font-bold text-white mb-6">Contact Information</h2>
                                        <p className="text-zinc-400 text-lg leading-relaxed">
                                            Reach out to us directly. Our dedicated team is available to assist with orders, accounts, and logistics.
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <ContactInfoCard
                                            icon={<MapPin className="h-6 w-6 text-blue-400" />}
                                            title="Headquarters"
                                            content="104 Anthony Road, Birmingham, B8 3AA"
                                        />
                                        <ContactInfoCard
                                            icon={<Phone className="h-6 w-6 text-emerald-400" />}
                                            title="Phone Number"
                                            content="+44 7477 956299"
                                        />
                                        <ContactInfoCard
                                            icon={<Mail className="h-6 w-6 text-indigo-400" />}
                                            title="Email Address"
                                            content="info@hksfoods.com"
                                        />
                                        <ContactInfoCard
                                            icon={<Clock className="h-6 w-6 text-orange-400" />}
                                            title="Business Hours"
                                            content="Monday - Friday: 8:00 AM - 6:00 PM"
                                        />
                                    </div>

                                    {/* Additional Info */}
                                    <div className="bg-zinc-900/60 p-8 rounded-2xl border border-zinc-800 backdrop-blur-sm">
                                        <h3 className="font-bold text-white mb-3 flex items-center gap-2 text-lg">
                                            <Building2 className="h-5 w-5 text-blue-500" />
                                            Trade Accounts
                                        </h3>
                                        <p className="text-zinc-400 leading-relaxed">
                                            Looking to open a trade account? Please contact our sales team directly for application forms and credit terms.
                                        </p>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Map Section */}
                <section className="py-16">
                    <div className="container mx-auto px-4">
                        <div className="max-w-6xl mx-auto">
                            <div className="rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 grayscale hover:grayscale-0 transition-all duration-700 h-[450px]">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2429.8!2d-1.8904!3d52.4862!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4870bc87095b92a7%3A0x40c0c8e0c0c0c0c0!2s104%20Anthony%20Rd%2C%20Birmingham%20B8%203AA%2C%20UK!5e0!3m2!1sen!2s!4v1234567890123!5m2!1sen!2s"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="HKS Foods Location"
                                    className="w-full h-full"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <PublicFooter />
            </div>
        </PageTransition>
    )
}

function ContactInfoCard({ icon, title, content }: { icon: React.ReactNode, title: string, content: string }) {
    return (
        <div className="flex items-start gap-4 p-5 bg-zinc-900/40 border border-zinc-800 rounded-2xl hover:bg-zinc-800/60 hover:border-zinc-700 transition-all duration-300">
            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">{icon}</div>
            <div>
                <h3 className="font-bold text-white mb-1 text-lg">{title}</h3>
                <p className="text-zinc-400">{content}</p>
            </div>
        </div>
    )
}
