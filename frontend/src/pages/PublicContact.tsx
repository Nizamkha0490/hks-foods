import { PublicNav } from "@/components/PublicNav"
import { PublicFooter } from "@/components/PublicFooter"
import { Mail, Phone, MapPin, Clock, Send, Building2, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { toast } from "sonner"
import api from "../utils/api"

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
        <div className="min-h-screen bg-white">
            <PublicNav />

            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-indigo-900 via-blue-900 to-cyan-900 text-white py-24 overflow-hidden">
                <div className="absolute inset-0 bg-[url('/assets/delivery-fleet.png')] opacity-10 bg-cover bg-center"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in-up">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-blue-100 font-medium text-sm">
                            <Mail className="h-4 w-4" />
                            <span>We're Here to Help</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                            Get in Touch <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">
                                With Our Team
                            </span>
                        </h1>
                        <p className="text-xl text-blue-100 leading-relaxed">
                            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* Contact Form */}
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Name */}
                                    <div>
                                        <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name *</Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="mt-2 h-12"
                                            placeholder="John Doe"
                                        />
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="mt-2 h-12"
                                            placeholder="john@example.com"
                                        />
                                    </div>

                                    {/* Phone and Company Row */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number</Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="mt-2 h-12"
                                                placeholder="+44 7477 956299"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="company" className="text-sm font-medium text-gray-700">Company Name</Label>
                                            <Input
                                                id="company"
                                                type="text"
                                                value={formData.company}
                                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                                className="mt-2 h-12"
                                                placeholder="Your Company Ltd"
                                            />
                                        </div>
                                    </div>

                                    {/* Address Section */}
                                    <div className="border-t pt-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <Home className="h-5 w-5 text-blue-600" />
                                            Address (Optional)
                                        </h3>

                                        {/* Street */}
                                        <div className="mb-4">
                                            <Label htmlFor="street" className="text-sm font-medium text-gray-700">Street Address</Label>
                                            <Input
                                                id="street"
                                                type="text"
                                                value={formData.street}
                                                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                                                className="mt-2 h-12"
                                                placeholder="123 Main Street"
                                            />
                                        </div>

                                        {/* City and Postal Code Row */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="city" className="text-sm font-medium text-gray-700">City</Label>
                                                <Input
                                                    id="city"
                                                    type="text"
                                                    value={formData.city}
                                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                    className="mt-2 h-12"
                                                    placeholder="Birmingham"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="postalCode" className="text-sm font-medium text-gray-700">Postal Code</Label>
                                                <Input
                                                    id="postalCode"
                                                    type="text"
                                                    value={formData.postalCode}
                                                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                                                    className="mt-2 h-12"
                                                    placeholder="B8 3AA"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Message */}
                                    <div>
                                        <Label htmlFor="message" className="text-sm font-medium text-gray-700">Message *</Label>
                                        <Textarea
                                            id="message"
                                            required
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            rows={6}
                                            className="mt-2 resize-none"
                                            placeholder="Tell us how we can help..."
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        size="lg"
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6 min-h-[48px] touch-manipulation"
                                        disabled={submitting}
                                    >
                                        {submitting ? "Sending..." : "Send Message"}
                                        {!submitting && <Send className="ml-2 h-5 w-5" />}
                                    </Button>
                                </form>
                            </div>

                            {/* Contact Information */}
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Contact Information</h2>
                                    <p className="text-gray-600 mb-8">
                                        Reach out to us through any of the following channels. Our team is ready to assist you.
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    <ContactInfoCard
                                        icon={<MapPin className="h-6 w-6 text-blue-600" />}
                                        title="Office Address"
                                        content="104 Anthony Road, Birmingham, B8 3AA"
                                    />
                                    <ContactInfoCard
                                        icon={<Phone className="h-6 w-6 text-green-600" />}
                                        title="Phone Number"
                                        content="+44 7477 956299"
                                    />
                                    <ContactInfoCard
                                        icon={<Mail className="h-6 w-6 text-purple-600" />}
                                        title="Email Address"
                                        content="info@hksfoods.com"
                                    />
                                    <ContactInfoCard
                                        icon={<Clock className="h-6 w-6 text-orange-600" />}
                                        title="Business Hours"
                                        content="Monday - Friday: 8:00 AM - 6:00 PM"
                                    />
                                </div>

                                {/* Additional Info */}
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                                    <h3 className="font-bold text-gray-900 mb-2">Quick Response</h3>
                                    <p className="text-sm text-gray-600">
                                        We typically respond to all inquiries within 24 hours during business days. For urgent matters, please call us directly.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Section */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-300">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2429.8!2d-1.8904!3d52.4862!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4870bc87095b92a7%3A0x40c0c8e0c0c0c0c0!2s104%20Anthony%20Rd%2C%20Birmingham%20B8%203AA%2C%20UK!5e0!3m2!1sen!2s!4v1234567890123!5m2!1sen!2s"
                                width="100%"
                                height="450"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="HKS Foods Location"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <PublicFooter />
        </div>
    )
}

function ContactInfoCard({ icon, title, content }: { icon: React.ReactNode, title: string, content: string }) {
    return (
        <div className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
            <div>
                <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
                <p className="text-gray-600">{content}</p>
            </div>
        </div>
    )
}
