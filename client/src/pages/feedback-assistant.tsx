import { useState, useRef } from "react";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  ArrowRight,
  FileText, 
  Copy, 
  Check, 
  Sparkles,
  Edit3,
  RefreshCw,
  CheckCircle2,
  Circle,
  Pencil,
  Upload,
  X,
  Image as ImageIcon
} from "lucide-react";

type Step = 1 | 2 | 3;

export default function FeedbackAssistant() {
  const { toast } = useToast();
  const rubricFileRef = useRef<HTMLInputElement>(null);
  const exampleWorkFileRef = useRef<HTMLInputElement>(null);
  
  const [currentStep, setCurrentStep] = useState<Step>(1);
  
  // Step 1: Setup
  const [rubric, setRubric] = useState("");
  const [rubricFile, setRubricFile] = useState<File | null>(null);
  const [rubricFilePreview, setRubricFilePreview] = useState<string | null>(null);
  const [exampleWork, setExampleWork] = useState("");
  const [exampleWorkFile, setExampleWorkFile] = useState<File | null>(null);
  const [exampleWorkFilePreview, setExampleWorkFilePreview] = useState<string | null>(null);
  
  // Step 2: Train
  const [sampleFeedback, setSampleFeedback] = useState("");
  
  // Step 3: Generate
  const [newStudentWork, setNewStudentWork] = useState("");
  const [generatedFeedback, setGeneratedFeedback] = useState("");
  
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleRubricFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/gif", "image/webp", "text/plain"];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF, image, or text file.",
          variant: "destructive",
        });
        return;
      }
      
      setRubricFile(file);
      
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setRubricFilePreview(url);
      } else {
        setRubricFilePreview(null);
      }
      
      if (file.type === "text/plain") {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          setRubric(text);
        };
        reader.readAsText(file);
      }
    }
  };

  const removeRubricFile = () => {
    if (rubricFilePreview) {
      URL.revokeObjectURL(rubricFilePreview);
    }
    setRubricFile(null);
    setRubricFilePreview(null);
    if (rubricFileRef.current) {
      rubricFileRef.current.value = "";
    }
  };

  const handleExampleWorkFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/gif", "image/webp", "text/plain"];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF, image, or text file.",
          variant: "destructive",
        });
        return;
      }
      
      setExampleWorkFile(file);
      
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setExampleWorkFilePreview(url);
      } else {
        setExampleWorkFilePreview(null);
      }
      
      if (file.type === "text/plain") {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          setExampleWork(text);
        };
        reader.readAsText(file);
      }
    }
  };

  const removeExampleWorkFile = () => {
    if (exampleWorkFilePreview) {
      URL.revokeObjectURL(exampleWorkFilePreview);
    }
    setExampleWorkFile(null);
    setExampleWorkFilePreview(null);
    if (exampleWorkFileRef.current) {
      exampleWorkFileRef.current.value = "";
    }
  };

  const generateFeedbackMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/feedback/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rubric: rubric.trim(),
          exampleWork: exampleWork.trim(),
          sampleFeedback: sampleFeedback.trim(),
          newStudentWork: newStudentWork.trim(),
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to generate feedback");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedFeedback(data.feedback);
      setIsGenerating(false);
      toast({
        title: "Feedback Generated",
        description: "Review and edit before sharing with your student.",
      });
    },
    onError: () => {
      setIsGenerating(false);
      toast({
        title: "Generation Failed",
        description: "Could not generate feedback. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!newStudentWork.trim()) {
      toast({
        title: "Student Work Required",
        description: "Please paste the student's work to generate feedback.",
        variant: "destructive",
      });
      return;
    }
    setIsGenerating(true);
    generateFeedbackMutation.mutate();
  };

  const handleCopyFeedback = async () => {
    try {
      await navigator.clipboard.writeText(generatedFeedback);
      setCopied(true);
      toast({
        title: "Copied to Clipboard",
        description: "Feedback has been copied.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const clearAll = () => {
    setCurrentStep(1);
    setRubric("");
    setExampleWork("");
    setSampleFeedback("");
    setNewStudentWork("");
    setGeneratedFeedback("");
    removeRubricFile();
    removeExampleWorkFile();
  };

  const canProceedStep1 = rubric.trim().length > 0 && exampleWork.trim().length > 0;
  const canProceedStep2 = sampleFeedback.trim().length > 0;

  const StepIndicator = ({ step, label }: { step: Step; label: string }) => {
    const isCompleted = currentStep > step;
    const isCurrent = currentStep === step;
    
    return (
      <div 
        className={`flex items-center gap-2 cursor-pointer transition-opacity ${
          isCurrent ? "opacity-100" : "opacity-60"
        }`}
        onClick={() => {
          if (step < currentStep) setCurrentStep(step);
        }}
        data-testid={`step-indicator-${step}`}
      >
        {isCompleted ? (
          <CheckCircle2 className="h-6 w-6 text-green-500" />
        ) : isCurrent ? (
          <div className="h-6 w-6 rounded-full bg-[#6C4EE3] text-white flex items-center justify-center text-sm font-medium">
            {step}
          </div>
        ) : (
          <Circle className="h-6 w-6 text-slate-300 dark:text-slate-600" />
        )}
        <span className={`text-sm font-medium ${isCurrent ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}>
          {label}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
      <header className="border-b bg-white dark:bg-slate-900 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button
                size="sm"
                className="rounded-full bg-[#6C4EE3] text-white"
                data-testid="button-new-chat-header"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                New Chat
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <img 
                src="/logo.png" 
                alt="TeacherBuddy" 
                className="h-10 object-contain"
                data-testid="img-logo"
              />
              <span className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                Students Grader
              </span>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearAll}
            data-testid="button-clear"
          >
            Start Over
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Step Progress */}
          <div className="flex items-center justify-center gap-4 md:gap-8 mb-8">
            <StepIndicator step={1} label="Setup" />
            <div className="h-px w-8 bg-slate-200 dark:bg-slate-700" />
            <StepIndicator step={2} label="Train" />
            <div className="h-px w-8 bg-slate-200 dark:bg-slate-700" />
            <StepIndicator step={3} label="Generate" />
          </div>

          {/* Step 1: Setup */}
          {currentStep === 1 && (
            <Card className="p-6 space-y-6">
              <div className="text-center mb-4">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2">
                  <FileText className="h-5 w-5 text-[#6C4EE3]" />
                  Step 1: Setup Your Context
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Provide the rubric and an example of student work
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Rubric / Grading Criteria *
                </label>
                
                {/* File Upload Option */}
                <input
                  ref={rubricFileRef}
                  type="file"
                  accept=".pdf,.txt,image/*"
                  onChange={handleRubricFileUpload}
                  className="hidden"
                  data-testid="input-rubric-file"
                />
                
                {!rubricFile ? (
                  <div className="mb-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => rubricFileRef.current?.click()}
                      className="w-full h-16 border-dashed flex items-center justify-center gap-2"
                      data-testid="button-upload-rubric"
                    >
                      <Upload className="h-5 w-5 text-slate-400" />
                      <span className="text-sm text-slate-500">Upload rubric file (PDF, image, or text)</span>
                    </Button>
                    <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-1">
                      Or type/paste below
                    </p>
                  </div>
                ) : (
                  <div className="mb-3 border rounded-lg p-3 bg-slate-50 dark:bg-slate-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {rubricFile.type.startsWith("image/") ? (
                          <ImageIcon className="h-5 w-5 text-blue-500" />
                        ) : (
                          <FileText className="h-5 w-5 text-red-500" />
                        )}
                        <span className="text-sm truncate max-w-[250px]">{rubricFile.name}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={removeRubricFile}
                        data-testid="button-remove-rubric-file"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    {rubricFilePreview && (
                      <img 
                        src={rubricFilePreview} 
                        alt="Rubric preview" 
                        className="mt-3 max-h-48 rounded object-contain mx-auto"
                        data-testid="img-rubric-preview"
                      />
                    )}
                    {rubricFile.type === "application/pdf" && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
                        PDF uploaded - please also type key criteria below for AI processing
                      </p>
                    )}
                  </div>
                )}
                
                <Textarea
                  value={rubric}
                  onChange={(e) => setRubric(e.target.value)}
                  placeholder="Paste your rubric or describe what you're looking for...

Example:
- Clear thesis statement (20%)
- Supporting evidence (30%)
- Organization and flow (25%)
- Grammar and mechanics (25%)"
                  className="min-h-[120px]"
                  data-testid="input-rubric"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Example Student Work *
                </label>
                
                {/* File Upload Option */}
                <input
                  ref={exampleWorkFileRef}
                  type="file"
                  accept=".pdf,.txt,image/*"
                  onChange={handleExampleWorkFileUpload}
                  className="hidden"
                  data-testid="input-example-work-file"
                />
                
                {!exampleWorkFile ? (
                  <div className="mb-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => exampleWorkFileRef.current?.click()}
                      className="w-full h-16 border-dashed flex items-center justify-center gap-2"
                      data-testid="button-upload-example-work"
                    >
                      <Upload className="h-5 w-5 text-slate-400" />
                      <span className="text-sm text-slate-500">Upload student work (PDF, image, or text)</span>
                    </Button>
                    <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-1">
                      Or type/paste below
                    </p>
                  </div>
                ) : (
                  <div className="mb-3 border rounded-lg p-3 bg-slate-50 dark:bg-slate-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {exampleWorkFile.type.startsWith("image/") ? (
                          <ImageIcon className="h-5 w-5 text-blue-500" />
                        ) : (
                          <FileText className="h-5 w-5 text-red-500" />
                        )}
                        <span className="text-sm truncate max-w-[250px]">{exampleWorkFile.name}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={removeExampleWorkFile}
                        data-testid="button-remove-example-work-file"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    {exampleWorkFilePreview && (
                      <img 
                        src={exampleWorkFilePreview} 
                        alt="Student work preview" 
                        className="mt-3 max-h-48 rounded object-contain mx-auto"
                        data-testid="img-example-work-preview"
                      />
                    )}
                    {exampleWorkFile.type === "application/pdf" && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
                        PDF uploaded - please also type/paste the work below for AI processing
                      </p>
                    )}
                  </div>
                )}
                
                <Textarea
                  value={exampleWork}
                  onChange={(e) => setExampleWork(e.target.value)}
                  placeholder="Paste an example of student work that you've already graded..."
                  className="min-h-[120px]"
                  data-testid="input-example-work"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => setCurrentStep(2)}
                  disabled={!canProceedStep1}
                  className="bg-[#6C4EE3] text-white"
                  data-testid="button-next-step1"
                >
                  Next: Add Your Feedback Style
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </Card>
          )}

          {/* Step 2: Train */}
          {currentStep === 2 && (
            <Card className="p-6 space-y-6">
              <div className="text-center mb-4">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2">
                  <Edit3 className="h-5 w-5 text-[#6C4EE3]" />
                  Step 2: Train with Your Style
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Show us how YOU give feedback on the example work
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 mb-4">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Your example student work:</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-3">{exampleWork}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Your Sample Feedback *
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  Write feedback for the example work above. TeacherBuddy will learn your tone and style.
                </p>
                <Textarea
                  value={sampleFeedback}
                  onChange={(e) => setSampleFeedback(e.target.value)}
                  placeholder="Write your feedback for the example student work...

This teaches TeacherBuddy how YOU communicate with students - your tone, level of detail, and approach to constructive criticism."
                  className="min-h-[200px]"
                  data-testid="input-sample-feedback"
                />
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  data-testid="button-back-step2"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={() => setCurrentStep(3)}
                  disabled={!canProceedStep2}
                  className="bg-[#6C4EE3] text-white"
                  data-testid="button-next-step2"
                >
                  Next: Generate Feedback
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </Card>
          )}

          {/* Step 3: Generate */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <Card className="p-6 space-y-6">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2">
                    <Sparkles className="h-5 w-5 text-[#6C4EE3]" />
                    Step 3: Generate Feedback
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Paste new student work and get feedback in your style
                  </p>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <div className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Rubric loaded
                  </div>
                  <div className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Style learned
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    New Student Work *
                  </label>
                  <Textarea
                    value={newStudentWork}
                    onChange={(e) => setNewStudentWork(e.target.value)}
                    placeholder="Paste the student work you want feedback for..."
                    className="min-h-[150px]"
                    data-testid="input-new-student-work"
                  />
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                    data-testid="button-back-step3"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !newStudentWork.trim()}
                    className="bg-orange-500 text-white"
                    data-testid="button-generate"
                  >
                    {isGenerating ? (
                      <>
                        <Pencil className="h-4 w-4 mr-2 animate-pencil-write" />
                        Writing Feedback...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Feedback
                      </>
                    )}
                  </Button>
                </div>
              </Card>

              {/* Generated Feedback Output */}
              {(generatedFeedback || isGenerating) && (
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <Edit3 className="h-5 w-5" />
                      Generated Feedback
                    </h3>
                    {generatedFeedback && (
                      <Button
                        onClick={handleCopyFeedback}
                        className="bg-orange-500 text-white"
                        data-testid="button-copy-feedback"
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {isGenerating ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Pencil className="h-12 w-12 text-green-500 animate-pencil-write mb-4" />
                      <p className="text-slate-600 dark:text-slate-400">Writing feedback in your style...</p>
                    </div>
                  ) : (
                    <>
                      <Textarea
                        value={generatedFeedback}
                        onChange={(e) => setGeneratedFeedback(e.target.value)}
                        className="min-h-[200px] mb-4"
                        data-testid="input-generated-feedback"
                      />
                      <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                        Edit as needed before sharing with your student
                      </p>
                    </>
                  )}
                </Card>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t bg-white dark:bg-slate-900 py-4">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-slate-500 dark:text-slate-400">
          TeacherBuddy Students Grader - AI learns your feedback style
        </div>
      </footer>
    </div>
  );
}
