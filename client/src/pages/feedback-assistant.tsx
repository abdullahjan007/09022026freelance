import { useState, useRef } from "react";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  Copy, 
  Check, 
  Loader2,
  Sparkles,
  Edit3,
  X,
  Image as ImageIcon
} from "lucide-react";
import type { FeedbackRequest, FeedbackResponse } from "@shared/schema";

export default function FeedbackAssistant() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [studentWork, setStudentWork] = useState("");
  const [learningFocus, setLearningFocus] = useState("");
  const [rubric, setRubric] = useState("");
  const [mustInclude, setMustInclude] = useState("");
  const [mustAvoid, setMustAvoid] = useState("");
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  
  const [strengths, setStrengths] = useState<string[]>([]);
  const [growthOpportunities, setGrowthOpportunities] = useState<string[]>([]);
  const [nextSteps, setNextSteps] = useState("");
  
  const [copied, setCopied] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const generateFeedbackMutation = useMutation({
    mutationFn: async (request: FeedbackRequest): Promise<FeedbackResponse> => {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });
      if (!response.ok) {
        throw new Error("Failed to generate feedback");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setStrengths(data.strengths);
      setGrowthOpportunities(data.growthOpportunities);
      setNextSteps(data.nextSteps);
      setHasGenerated(true);
      toast({
        title: "Feedback Generated",
        description: "Review and edit the feedback before sharing with your student.",
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Could not generate feedback. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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
      
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF or image file.",
          variant: "destructive",
        });
        return;
      }
      
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setFilePreviewUrl(url);
    }
  };

  const removeFile = () => {
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
    }
    setUploadedFile(null);
    setFilePreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleGenerate = () => {
    if (!studentWork.trim()) {
      toast({
        title: "Student Work Required",
        description: "Please paste the student's work text to generate feedback. File uploads are for your reference.",
        variant: "destructive",
      });
      return;
    }
    
    generateFeedbackMutation.mutate({
      studentWork: studentWork.trim(),
      learningFocus: learningFocus.trim() || undefined,
      rubric: rubric.trim() || undefined,
      mustInclude: mustInclude.trim() || undefined,
      mustAvoid: mustAvoid.trim() || undefined,
    });
  };

  const handleCopyFeedback = async () => {
    const feedbackText = `STRENGTHS OBSERVED:
${strengths.map(s => `• ${s}`).join("\n")}

GROWTH OPPORTUNITIES:
${growthOpportunities.map(g => `• ${g}`).join("\n")}

NEXT STEPS:
${nextSteps}`;

    try {
      await navigator.clipboard.writeText(feedbackText);
      setCopied(true);
      toast({
        title: "Copied to Clipboard",
        description: "Feedback has been copied as plain text.",
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

  const updateStrength = (index: number, value: string) => {
    const updated = [...strengths];
    updated[index] = value;
    setStrengths(updated);
  };

  const updateGrowth = (index: number, value: string) => {
    const updated = [...growthOpportunities];
    updated[index] = value;
    setGrowthOpportunities(updated);
  };

  const addStrength = () => {
    setStrengths([...strengths, ""]);
  };

  const addGrowth = () => {
    setGrowthOpportunities([...growthOpportunities, ""]);
  };

  const removeStrength = (index: number) => {
    setStrengths(strengths.filter((_, i) => i !== index));
  };

  const removeGrowth = (index: number) => {
    setGrowthOpportunities(growthOpportunities.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setStudentWork("");
    setLearningFocus("");
    setRubric("");
    setMustInclude("");
    setMustAvoid("");
    setStrengths([]);
    setGrowthOpportunities([]);
    setNextSteps("");
    setHasGenerated(false);
    removeFile();
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
      <header className="border-b bg-white dark:bg-slate-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" data-testid="button-back">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
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
                Feedback Assistant
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasGenerated && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearAll}
                data-testid="button-clear"
              >
                Clear All
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              You own the final feedback. All AI-generated text is fully editable.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Student Work Input
              </h2>
              
              <Card className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Learning Focus (Optional)
                  </label>
                  <Textarea
                    value={learningFocus}
                    onChange={(e) => setLearningFocus(e.target.value)}
                    placeholder="e.g., Persuasive writing techniques, thesis statement development"
                    className="min-h-[60px]"
                    data-testid="input-learning-focus"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Rubric or Criteria (Optional)
                  </label>
                  <Textarea
                    value={rubric}
                    onChange={(e) => setRubric(e.target.value)}
                    placeholder="e.g., Clear thesis, supporting evidence, proper citations, grammar"
                    className="min-h-[60px]"
                    data-testid="input-rubric"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Student Work
                  </label>
                  <Textarea
                    value={studentWork}
                    onChange={(e) => setStudentWork(e.target.value)}
                    placeholder="Paste student work here..."
                    className="min-h-[150px]"
                    data-testid="input-student-work"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Upload for Reference (Optional)
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    Upload student work to view while writing feedback. Paste text above to generate feedback.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    data-testid="input-file-upload"
                  />
                  
                  {!uploadedFile ? (
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-24 border-dashed flex flex-col items-center justify-center gap-2"
                      data-testid="button-upload"
                    >
                      <Upload className="h-6 w-6 text-slate-400" />
                      <span className="text-sm text-slate-500">Click to upload (max 5MB)</span>
                    </Button>
                  ) : (
                    <div className="border rounded-lg p-3 bg-slate-50 dark:bg-slate-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {uploadedFile.type.startsWith("image/") ? (
                            <ImageIcon className="h-5 w-5 text-blue-500" />
                          ) : (
                            <FileText className="h-5 w-5 text-red-500" />
                          )}
                          <span className="text-sm truncate max-w-[200px]">{uploadedFile.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={removeFile}
                          data-testid="button-remove-file"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {filePreviewUrl && uploadedFile.type.startsWith("image/") && (
                        <img 
                          src={filePreviewUrl} 
                          alt="Preview" 
                          className="mt-3 max-h-48 rounded object-contain"
                          data-testid="img-file-preview"
                        />
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Must Include (Optional)
                    </label>
                    <Textarea
                      value={mustInclude}
                      onChange={(e) => setMustInclude(e.target.value)}
                      placeholder="e.g., Mention improvement in organization"
                      className="min-h-[60px]"
                      data-testid="input-must-include"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Must Avoid (Optional)
                    </label>
                    <Textarea
                      value={mustAvoid}
                      onChange={(e) => setMustAvoid(e.target.value)}
                      placeholder="e.g., Do not mention spelling errors"
                      className="min-h-[60px]"
                      data-testid="input-must-avoid"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={generateFeedbackMutation.isPending || !studentWork.trim()}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  data-testid="button-generate"
                >
                  {generateFeedbackMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Feedback...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Feedback Draft
                    </>
                  )}
                </Button>
              </Card>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Edit3 className="h-5 w-5" />
                  Editable Feedback Draft
                </h2>
                {hasGenerated && (
                  <Button
                    onClick={handleCopyFeedback}
                    disabled={!hasGenerated || generateFeedbackMutation.isPending}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
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
                        Copy Feedback
                      </>
                    )}
                  </Button>
                )}
              </div>

              <Card className="p-4 space-y-6 min-h-[500px]">
                {!hasGenerated && !generateFeedbackMutation.isPending ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <Sparkles className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">
                      Enter student work and click "Generate Feedback Draft" to get started.
                    </p>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">
                      All generated text will be fully editable.
                    </p>
                  </div>
                ) : generateFeedbackMutation.isPending ? (
                  <div className="flex flex-col items-center justify-center h-full py-12">
                    <Loader2 className="h-12 w-12 text-orange-500 animate-spin mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">Generating feedback...</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-semibold text-green-700 dark:text-green-400">
                          Strengths Observed
                        </label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={addStrength}
                          data-testid="button-add-strength"
                        >
                          + Add
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {strengths.map((strength, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <span className="text-green-600 mt-2">•</span>
                            <Textarea
                              value={strength}
                              onChange={(e) => updateStrength(index, e.target.value)}
                              className="flex-1 min-h-[40px] resize-none"
                              data-testid={`input-strength-${index}`}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeStrength(index)}
                              className="text-slate-400 hover:text-red-500"
                              data-testid={`button-remove-strength-${index}`}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-semibold text-amber-700 dark:text-amber-400">
                          Growth Opportunities
                        </label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={addGrowth}
                          data-testid="button-add-growth"
                        >
                          + Add
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {growthOpportunities.map((opportunity, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <span className="text-amber-600 mt-2">•</span>
                            <Textarea
                              value={opportunity}
                              onChange={(e) => updateGrowth(index, e.target.value)}
                              className="flex-1 min-h-[40px] resize-none"
                              data-testid={`input-growth-${index}`}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeGrowth(index)}
                              className="text-slate-400 hover:text-red-500"
                              data-testid={`button-remove-growth-${index}`}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-blue-700 dark:text-blue-400 mb-3">
                        Next Steps
                      </label>
                      <Textarea
                        value={nextSteps}
                        onChange={(e) => setNextSteps(e.target.value)}
                        className="min-h-[100px]"
                        placeholder="Specific, actionable next steps for the student..."
                        data-testid="input-next-steps"
                      />
                    </div>

                    <div className="pt-4 border-t text-xs text-slate-500 dark:text-slate-400 text-center">
                      Remember: You own the final feedback. Edit as needed before sharing.
                    </div>
                  </>
                )}
              </Card>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t bg-white dark:bg-slate-900 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-500 dark:text-slate-400">
          TeacherBuddy Feedback Assistant - AI-generated drafts require teacher review
        </div>
      </footer>
    </div>
  );
}
