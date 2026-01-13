import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle, Mail, Shield, FileWarning } from "lucide-react";

export default function ReportAbuse() {
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
              Report Abuse Policy
            </h1>
            <p className="text-slate-500 dark:text-slate-400">Effective Date: January 14, 2026</p>
            <div className="w-20 h-1 bg-orange-500 mx-auto rounded-full mt-4" />
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-8">
              TeacherBuddy is committed to maintaining a safe, respectful, and professional environment for educators. While the platform is designed for constructive educational use, we recognize that misuse may occur. This policy outlines how to report abusive, illegal, or inappropriate content or behaviour—and how we respond.
            </p>

            <section className="mb-10">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                1. What Constitutes Abuse?
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">You may report content or conduct that:</p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2 mb-4">
                <li>Violates applicable laws (e.g., defamation, harassment, copyright infringement);</li>
                <li>Contains hate speech, threats, or discriminatory language;</li>
                <li>Attempts to impersonate another individual or institution;</li>
                <li>Involves unauthorised sharing of confidential or sensitive information;</li>
                <li>Exploits the platform for spam, phishing, or malicious activity;</li>
                <li>Otherwise breaches our <Link href="/terms"><span className="text-orange-600 dark:text-orange-400 hover:underline cursor-pointer">Terms of Use</span></Link> or professional standards.</li>
              </ul>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border-l-4 border-orange-500">
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  <strong>Note:</strong> TeacherBuddy does not host user-to-user communication or public content feeds. Most inputs are private and ephemeral. Reports typically relate to AI-generated outputs that inadvertently produce harmful, biased, or inaccurate material.
                </p>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Mail className="h-5 w-5 text-orange-500" />
                2. How to Report
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">To submit a report:</p>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6 border border-orange-200 dark:border-orange-800 mb-4">
                <ol className="list-decimal pl-4 text-slate-700 dark:text-slate-300 space-y-3">
                  <li>
                    Email <span className="text-orange-600 dark:text-orange-400 font-medium">graderelite@gmail.com</span> with the subject line: <em>"Abuse Report – [Brief Description]"</em>
                  </li>
                  <li>
                    Include:
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>Your name and registered email address (if applicable);</li>
                      <li>Date and time of the incident;</li>
                      <li>Description of the issue;</li>
                      <li>Screenshots or copied text (if available);</li>
                      <li>Any other relevant context.</li>
                    </ul>
                  </li>
                </ol>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                All reports are treated as confidential and reviewed promptly.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-orange-500" />
                3. Our Response Process
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">Upon receipt of a valid report, we will:</p>
              <ul className="list-disc pl-6 text-slate-700 dark:text-slate-300 space-y-2">
                <li>Acknowledge your submission within 48 hours;</li>
                <li>Investigate the matter in good faith;</li>
                <li>Take appropriate action, which may include:
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Removing or blocking problematic content;</li>
                    <li>Disabling accounts involved in malicious activity;</li>
                    <li>Refining AI safeguards to prevent recurrence;</li>
                    <li>Reporting illegal activity to relevant authorities where required by law.</li>
                  </ul>
                </li>
              </ul>
              <p className="text-slate-600 dark:text-slate-400 mt-4 text-sm italic">
                We do not mediate interpersonal disputes unrelated to platform misuse.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <FileWarning className="h-5 w-5 text-orange-500" />
                4. False or Frivolous Reports
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                Knowingly submitting false or vexatious reports may result in restriction of your access to the platform. Abuse reporting mechanisms must be used in good faith.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">5. No Liability for Third-Party Content</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                While we act expeditiously on valid notices, TeacherBuddy disclaims liability for user inputs or AI-generated outputs not affirmatively endorsed by us. Users remain solely responsible for their use of the platform.
              </p>
              <p className="text-slate-600 dark:text-slate-400 mt-4 text-sm">
                For urgent legal notices (e.g., DMCA takedown requests), please label your email accordingly and include all elements required under applicable law.
              </p>
            </section>

            <section className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 text-center">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Contact</h3>
              <a 
                href="mailto:graderelite@gmail.com" 
                className="text-orange-600 dark:text-orange-400 font-medium text-lg hover:underline"
                data-testid="link-email"
              >
                graderelite@gmail.com
              </a>
            </section>
          </div>

          <div className="mt-12 text-center">
            <Link href="/">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white" data-testid="button-back-home">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t bg-white dark:bg-slate-900 py-6">
        <div className="max-w-5xl mx-auto px-4 flex flex-col items-center gap-4">
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
    </div>
  );
}
