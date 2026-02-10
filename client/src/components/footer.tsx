import { Link } from "wouter";

export function Footer() {
    return (
        <footer className="border-t bg-white dark:bg-slate-900 py-6">
            <div className="max-w-5xl mx-auto px-4 flex flex-col items-center gap-4">
                <nav className="flex items-center gap-6 text-sm text-orange-500 dark:text-orange-400">
                    <Link href="/our-story">
                        <span className="hover:underline cursor-pointer" data-testid="link-our-story">Our Story</span>
                    </Link>
                    <Link href="/terms">
                        <span className="hover:underline cursor-pointer" data-testid="link-terms">Terms and Privacy</span>
                    </Link>
                    <Link href="/report-abuse">
                        <span className="hover:underline cursor-pointer" data-testid="link-report">Report Abuse</span>
                    </Link>
                    <Link href="/contact">
                        <span className="hover:underline cursor-pointer" data-testid="link-contact">Contact Us</span>
                    </Link>
                </nav>

                <img
                    src="/logo.png"
                    alt="TeacherBuddy"
                    className="h-12 object-contain opacity-80"
                    data-testid="img-footer-logo"
                />
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                    Built by teachers, for teachers.
                </p>
            </div>
        </footer>
    );
}
