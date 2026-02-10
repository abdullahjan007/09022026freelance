import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { Footer } from "@/components/footer";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "Feature Request",
        message: ""
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Construct the mailto link
        const mailtoLink = `mailto:support@taskmasterforteachers.com?subject=${encodeURIComponent(`${formData.subject} - from ${formData.name}`)}&body=${encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`)}`;

        // Open the user's email client
        window.location.href = mailtoLink;

        // Show success state
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitted(true);
            toast({
                title: "Opening Email Client",
                description: "Your feedback has been prepared in your default email app.",
            });
        }, 1000);
    };

    return (
        <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
            <header className="border-b bg-white dark:bg-slate-900 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-center relative">
                        <Link href="/">
                            <Button variant="ghost" size="sm" className="absolute left-0" data-testid="button-back">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <img
                            src="/logo.png"
                            alt="TeacherBuddy"
                            className="h-16 object-contain"
                            data-testid="img-logo"
                        />
                    </div>
                </div>
            </header>

            <main className="flex-1 py-12 px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                            Contact Us
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">We're here to help you succeed in your teaching journey.</p>
                        <div className="w-20 h-1 bg-orange-500 mx-auto rounded-full mt-4" />
                    </div>

                    <div className="flex justify-center mb-12">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center max-w-md w-full">
                            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-4">
                                <Mail className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Email Support</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                                For urgent technical support or account inquiries, email us directly.
                            </p>
                            <a
                                href="mailto:support@taskmasterforteachers.com"
                                className="text-orange-600 dark:text-orange-400 font-medium hover:underline text-lg"
                            >
                                support@taskmasterforteachers.com
                            </a>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 mb-12 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                <MessageSquare className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Send us Feedback</h2>
                        </div>

                        {submitted ? (
                            <div className="py-12 text-center">
                                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Thank You!</h3>
                                <p className="text-slate-500 dark:text-slate-400">
                                    Your message has been prepared. If your email app didn't open, please click the button below.
                                </p>
                                <Button
                                    className="mt-6 bg-orange-500"
                                    onClick={() => window.location.href = `mailto:support@taskmasterforteachers.com?subject=${encodeURIComponent(`${formData.subject} - from ${formData.name}`)}&body=${encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`)}`}
                                >
                                    Open Email App Again
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="mt-6 ml-2"
                                    onClick={() => setSubmitted(false)}
                                >
                                    Send Another Message
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            placeholder="Your name"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="focus-visible:ring-orange-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="you@school.edu"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="focus-visible:ring-orange-500"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="subject">Subject</Label>
                                    <select
                                        id="subject"
                                        className="w-full h-10 px-3 py-2 bg-transparent border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    >
                                        <option value="Feature Request">Feature Request</option>
                                        <option value="Bug Report">Bug Report</option>
                                        <option value="General Question">General Question</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="message">How can we help?</Label>
                                    <Textarea
                                        id="message"
                                        placeholder="Tell us what's on your mind..."
                                        required
                                        rows={5}
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="focus-visible:ring-orange-500"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full bg-orange-500 hover:bg-orange-600 text-white gap-2 h-12 text-lg"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Preparing..." : "Submit Feedback"}
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        )}
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/30 p-8 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">Frequently Asked Questions</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">How can I change my subscription?</h4>
                                <p className="text-slate-600 dark:text-slate-400 text-sm">
                                    Manage your plan in the <Link href="/subscription"><span className="text-orange-600 hover:underline">Subscription</span></Link> page.
                                </p>
                            </div>
                            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Is my data secure?</h4>
                                <p className="text-slate-600 dark:text-slate-400 text-sm">
                                    Yes, we use AES-256 encryption. Read our <Link href="/terms"><span className="text-orange-600 hover:underline">Privacy Policy</span></Link>.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 text-center">
                        <Link href="/">
                            <Button variant="ghost" className="text-slate-500 hover:text-orange-600" data-testid="button-back-home">
                                Back to Home
                            </Button>
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
