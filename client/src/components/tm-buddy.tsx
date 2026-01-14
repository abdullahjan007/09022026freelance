import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";

interface BuddyMessage {
  role: "user" | "buddy";
  content: string;
}

const BUDDY_RESPONSES: { [key: string]: string } = {
  default: "Hi there! I'm TeacherBuddy, your AI-powered teaching assistant. I can help you with lesson planning, parent emails, behavior tracking, grading rubrics, and more! Just ask me anything.",
  greeting: "Hello! I'm TeacherBuddy, your AI teaching assistant. I'm here to help you with everyday classroom challenges. What would you like to know?",
  lesson: "To get help with lesson planning, simply type your request in the main chat. For example: 'Help me create a lesson plan for teaching fractions to 4th graders.' TeacherBuddy will first give you tips, then offer to create a complete lesson plan for you!",
  parent: "Need help with parent communications? Just describe the situation in the main chat. For example: 'Help me write an email to a parent about their child's behavior.' You'll get diplomatic suggestions first, then a ready-to-use email!",
  behavior: "For behavior tracking help, describe what you're dealing with. For example: 'Help me create a behavior tracking system for my classroom.' TeacherBuddy will provide strategies and can create tracking sheets for you!",
  rubric: "Need a grading rubric? Just ask! For example: 'Create a rubric for a 5th grade science project.' You'll get grading criteria suggestions first, then a complete rubric you can use!",
  how: "Here's how TeacherBuddy works: 1) Type your challenge in the chat box below. 2) TeacherBuddy gives you helpful tips and strategies. 3) Click 'Execute' to get ready-to-use materials. 4) Copy or download your materials!",
  chips: "The quick action buttons are shortcuts! Click any of them to fill in a starter prompt. You can then edit the text before sending, or just hit Send to use it as-is.",
  copy: "To copy any response, click the copy button (clipboard icon) next to the AI's message. You'll see a confirmation when it's copied!",
  download: "To download a conversation as a PDF, click the download button (arrow pointing down) next to any AI response. It creates a nicely formatted document!",
  history: "Your past conversations are saved! Click 'History' in the header to see, resume, or delete previous chats.",
  new: "To start a fresh conversation, click the 'New Chat' button. This clears the current chat so you can start on a new topic.",
  dark: "You can switch between light and dark mode using the theme toggle (sun/moon icon) in the top right corner.",
  formula: "Click 'How It Works' in the header to see a visual guide explaining TeacherBuddy's two-step process: first you get suggestions, then you can optionally ask TeacherBuddy to execute and create materials for you.",
  execute: "The Execute feature is step 2 of TeacherBuddy! After you receive suggestions, you can click 'Would You Like TeacherBuddy to Execute?' to have it create ready-to-use materials like lesson plans, emails, or rubrics.",
  student: "TeacherBuddy can help with student-related challenges! Just describe your situation in the main chat. For example: 'Help me engage unmotivated students' or 'Help me support struggling readers.'",
  classroom: "For classroom management help, describe your challenge in the main chat. TeacherBuddy can help with seating arrangements, routines, transitions, and more!",
  what: "TeacherBuddy is an AI assistant designed specifically for teachers. It helps you solve everyday challenges like lesson planning, parent communication, behavior management, and grading. Just type your problem and get practical solutions!",
  help: "I'd be happy to help! Here's what you can do: Type any teaching challenge in the main chat box, and TeacherBuddy will give you helpful suggestions. You can also click the quick action buttons for common topics like lesson planning or parent emails.",
  thanks: "You're welcome! I'm always here if you need help navigating TeacherBuddy. Good luck with your teaching!",
};

const KEYWORD_GROUPS: { keywords: string[]; response: string }[] = [
  { keywords: ["hello", "hi", "hey", "greetings", "good morning", "good afternoon"], response: "greeting" },
  { keywords: ["lesson", "plan", "curriculum", "unit", "activity", "teach", "instruction"], response: "lesson" },
  { keywords: ["parent", "email", "letter", "communicate", "message", "mom", "dad", "guardian", "family"], response: "parent" },
  { keywords: ["behavior", "track", "management", "discipline", "disrupt", "misbehav", "conduct", "reward", "consequence"], response: "behavior" },
  { keywords: ["rubric", "grad", "assess", "score", "evaluat", "criteria", "mark"], response: "rubric" },
  { keywords: ["how", "work", "use", "explain", "tutorial", "steps"], response: "how" },
  { keywords: ["chip", "quick", "button", "prompt", "shortcut", "action"], response: "chips" },
  { keywords: ["copy", "clipboard", "paste"], response: "copy" },
  { keywords: ["download", "pdf", "save", "export", "print"], response: "download" },
  { keywords: ["history", "past", "previous", "conversation", "chat", "session"], response: "history" },
  { keywords: ["new", "fresh", "clear", "reset", "another"], response: "new" },
  { keywords: ["dark", "light", "theme", "mode", "color", "night"], response: "dark" },
  { keywords: ["formula", "guide", "tip", "instruction", "step"], response: "formula" },
  { keywords: ["execute", "create", "make", "generate", "build", "produce", "material"], response: "execute" },
  { keywords: ["student", "kid", "child", "learner", "pupil"], response: "student" },
  { keywords: ["classroom", "class", "room", "seat", "routine"], response: "classroom" },
  { keywords: ["what", "purpose", "about", "does", "mean"], response: "what" },
  { keywords: ["help", "assist", "support", "need", "stuck", "confused"], response: "help" },
  { keywords: ["thank", "thanks", "appreciate", "great", "awesome", "perfect"], response: "thanks" },
];

function getBuddyResponse(input: string): string {
  const lower = input.toLowerCase();
  
  // Check each keyword group for matches
  let bestMatch: { response: string; score: number } | null = null;
  
  for (const group of KEYWORD_GROUPS) {
    let matchCount = 0;
    for (const keyword of group.keywords) {
      if (lower.includes(keyword)) {
        matchCount++;
      }
    }
    if (matchCount > 0 && (!bestMatch || matchCount > bestMatch.score)) {
      bestMatch = { response: group.response, score: matchCount };
    }
  }
  
  if (bestMatch && BUDDY_RESPONSES[bestMatch.response]) {
    return BUDDY_RESPONSES[bestMatch.response];
  }
  
  // Smart fallback: detect intent and suggest relevant features
  const hasQuestion = lower.includes("?") || lower.startsWith("what") || lower.startsWith("how") || lower.startsWith("where") || lower.startsWith("can") || lower.startsWith("do");
  
  if (hasQuestion) {
    return "That's a great question! While I may not have a specific answer for that, here's how I can help: If you're looking to solve a teaching challenge, just type it in the main chat box below. TeacherBuddy can assist with lesson plans, parent emails, behavior strategies, grading rubrics, and much more. Would you like to know about any of these?";
  }
  
  // Check if they mentioned something teaching-related
  const teachingWords = ["teach", "school", "class", "grade", "subject", "math", "science", "english", "reading", "writing", "homework", "assignment", "project", "test", "quiz", "exam"];
  const mentionedTeaching = teachingWords.some(word => lower.includes(word));
  
  if (mentionedTeaching) {
    return "It sounds like you have a teaching-related question! The main chat is the best place to get detailed help. Just describe your challenge there, and TeacherBuddy will provide suggestions. If you want ready-to-use materials, click the Execute button after receiving suggestions.";
  }
  
  // Friendly general fallback
  return "I'm here to help you navigate TeacherBuddy! Here are some things I can assist with: understanding how the app works, finding features like copy or download, learning about the two-step process (Suggestions then Execute), or getting started with quick action prompts. What would you like to explore?";
}

export function TMBuddy() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<BuddyMessage[]>([
    { role: "buddy", content: BUDDY_RESPONSES.default }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    
    setTimeout(() => {
      const response = getBuddyResponse(userMessage);
      setMessages(prev => [...prev, { role: "buddy", content: response }]);
    }, 300);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 z-50 rounded-full w-14 h-14 shadow-lg bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        size="icon"
        data-testid="button-tm-buddy-toggle"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-24 left-6 z-50 w-80 sm:w-96 shadow-2xl border-indigo-200 dark:border-indigo-800 overflow-hidden">
          {/* Header */}
          <div className="bg-indigo-600 dark:bg-indigo-700 p-3 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">TeacherBuddy</h3>
              <p className="text-indigo-200 text-xs">Your AI teaching assistant</p>
            </div>
          </div>

          {/* Messages */}
          <div className="h-72 overflow-y-auto p-3 space-y-3 bg-slate-50 dark:bg-slate-900">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                  }`}
                  data-testid={`message-buddy-${idx}`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about features..."
                className="flex-1 text-sm"
                data-testid="input-buddy-message"
              />
              <Button
                onClick={handleSend}
                size="icon"
                className="bg-indigo-600 hover:bg-indigo-700"
                data-testid="button-buddy-send"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
}
