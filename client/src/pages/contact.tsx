import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, MessageSquare, Phone, MapPin } from "lucide-react";
import { Footer } from "@/components/footer";

export default function Contact() {
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-4">
                                <Mail className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Email Support</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                                Our support team is available 24/7 to answer your questions.
                            </p>
                            <a
                                href="mailto:support@taskmasterforteachers.com"
                                className="text-orange-600 dark:text-orange-400 font-medium hover:underline"
                            >
                                support@taskmasterforteachers.com
                            </a>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-4">
                                <MessageSquare className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Feedback</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                                Have a feature request or suggestion? We'd love to hear from you.
                            </p>
                            <Link href="/feedback">
                                <Button variant="outline" className="border-orange-200 dark:border-orange-800">
                                    Go to Feedback
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">Frequently Asked Questions</h2>
                        <div className="space-y-6">
                            <div>
                                <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">How can I change my subscription?</h4>
                                <p className="text-slate-600 dark:text-slate-400 text-sm">
                                    You can manage your subscription by going to the Subscription page from the sidebar menu.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Can I use TeacherBuddy on multiple devices?</h4>
                                <p className="text-slate-600 dark:text-slate-400 text-sm">
                                    Yes, you can log in to your account from any device with a web browser.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Is my data secure?</h4>
                                <p className="text-slate-600 dark:text-slate-400 text-sm">
                                    Absolutely. We use industry-standard encryption to protect your data. Check our <Link href="/terms"><span className="text-orange-600 dark:text-orange-400 hover:underline cursor-pointer">Privacy Policy</span></Link> for details.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 text-center">
                        <Link href="/">
                            <Button className="bg-orange-500 text-white" data-testid="button-back-home">
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
