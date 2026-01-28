import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, UserPlus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CURRICULUM_OPTIONS = [
  { value: "ib", label: "International Baccalaureate (IB)" },
  { value: "igcse", label: "Cambridge IGCSE" },
  { value: "american", label: "American Curriculum" },
  { value: "british", label: "British National Curriculum" },
  { value: "cbse", label: "CBSE (India)" },
  { value: "other", label: "Other" },
];

export default function Register() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [userName, setUserName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [email, setEmail] = useState("");
  const [curriculum, setCurriculum] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormValid = 
    userName.trim().length > 0 && 
    schoolName.trim().length > 0 && 
    email.trim().length > 0 && 
    curriculum.length > 0 &&
    acceptTerms && 
    acceptPrivacy;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) {
      toast({
        title: "Please Complete All Fields",
        description: "Fill in all required fields and accept the terms.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate registration (would connect to backend in production)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Registration Successful!",
      description: "Welcome to TeacherBuddy. You can now start using all features.",
    });
    
    setIsSubmitting(false);
    
    // Redirect to home after successful registration
    setLocation("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 sticky top-0 z-50 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              data-testid="button-back-home"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <span className="text-xl font-bold text-[#6C4EE3]" data-testid="text-logo">TeacherBuddy</span>
          <div className="w-20" />
        </div>
      </header>

      {/* Registration Form */}
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6 md:p-8 shadow-lg">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-4">
              <UserPlus className="h-8 w-8 text-[#6C4EE3]" />
            </div>
            <h1 className="text-2xl font-bold text-[#6C4EE3] mb-2">Register</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Join TeacherBuddy and unlock powerful teaching tools
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* User Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                User Name
              </label>
              <Input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Your full name"
                className="w-full"
                data-testid="input-user-name"
              />
            </div>

            {/* School Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                School Name
              </label>
              <Input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="Your school or institution"
                className="w-full"
                data-testid="input-school-name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@school.edu"
                className="w-full"
                data-testid="input-email"
              />
            </div>

            {/* Curriculum */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Curriculum
              </label>
              <Select value={curriculum} onValueChange={setCurriculum}>
                <SelectTrigger className="w-full" data-testid="select-curriculum">
                  <SelectValue placeholder="Select your curriculum" />
                </SelectTrigger>
                <SelectContent>
                  {CURRICULUM_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Terms & Privacy Checkboxes */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="accept-terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                  data-testid="checkbox-terms"
                />
                <label htmlFor="accept-terms" className="text-sm text-slate-600 dark:text-slate-400 leading-tight cursor-pointer">
                  I Accept{" "}
                  <Link href="/terms" className="text-[#6C4EE3] hover:underline">
                    Terms and Conditions
                  </Link>
                </label>
              </div>
              
              <div className="flex items-start gap-3">
                <Checkbox
                  id="accept-privacy"
                  checked={acceptPrivacy}
                  onCheckedChange={(checked) => setAcceptPrivacy(checked === true)}
                  data-testid="checkbox-privacy"
                />
                <label htmlFor="accept-privacy" className="text-sm text-slate-600 dark:text-slate-400 leading-tight cursor-pointer">
                  I Accept{" "}
                  <Link href="/terms" className="text-[#6C4EE3] hover:underline">
                    Data Privacy Policy
                  </Link>
                </label>
              </div>
            </div>

            {/* Register Button */}
            <Button
              type="submit"
              size="lg"
              disabled={!isFormValid || isSubmitting}
              className="w-full bg-[#6C4EE3] text-white mt-4"
              data-testid="button-register-submit"
            >
              {isSubmitting ? "Registering..." : "Register"}
            </Button>
          </form>

          {/* Already Registered Link */}
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            Already registered?{" "}
            <Link href="/" className="text-[#6C4EE3] font-medium hover:underline">
              Go to Home
            </Link>
          </p>
        </Card>
      </main>
    </div>
  );
}
