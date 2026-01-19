import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, Users, Clock, Sparkles } from "lucide-react";

export default function OurStory() {
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
              Our Story
            </h1>
            <div className="w-20 h-1 bg-orange-500 mx-auto rounded-full" />
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-8">
              We are teachers—just like you—who watched too many brilliant educators walk away, crushed by burnout, bureaucracy, and sleepless nights. <strong className="text-slate-900 dark:text-slate-100">Enough was enough.</strong>
            </p>

            <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-8">
              That's why we created <span className="text-orange-600 dark:text-orange-400 font-semibold">TeacherBuddy</span>: not another app to clutter your day, but a lifeline to reclaim it.
            </p>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 md:p-8 mb-10">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                The Crisis Is Real
              </h2>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-slate-700 dark:text-slate-300">
                      A 2023 RAND Corporation study revealed <strong className="text-slate-900 dark:text-slate-100">1 in 4 teachers battles depression</strong> fuelled by job stress.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                    <Heart className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-slate-700 dark:text-slate-300">
                      UNESCO warns that <strong className="text-slate-900 dark:text-slate-100">nearly 40% of educators worldwide</strong> are seriously thinking of quitting—all because the system demands everything and gives back so little.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-slate-700 dark:text-slate-300">
                      In India, research from NCERT and teacher accreditation bodies shows <strong className="text-slate-900 dark:text-slate-100">over 60% of us waste 10+ hours every week</strong> on emails, reports, and paperwork—time stolen from our students... and our lives.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-8 italic border-l-4 border-orange-500 pl-6">
              We've graded papers at 2 a.m., canceled family dinners, and cried in empty classrooms.
            </p>

            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-6 md:p-8 mb-10 border border-orange-200 dark:border-orange-800">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    TeacherBuddy Fights Back
                  </h3>
                  <p className="text-lg text-slate-700 dark:text-slate-300">
                    Automating the grind so you can teach with joy again.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xl text-center font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
              Because you didn't become a teacher to drown—<br />
              <span className="text-orange-600 dark:text-orange-400">you became one to inspire.</span>
            </p>
          </div>

          <div className="mt-12 text-center">
            <Link href="/">
              <Button className="bg-orange-500 text-white" data-testid="button-get-started">
                Start Using TeacherBuddy
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
