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
  default: "Hi there! I'm TM Buddy, your guide to TaskMaster. I can help you understand how to use this app. Try asking me about lesson plans, parent emails, behavior tracking, or grading rubrics!",
  greeting: "Hello! I'm TM Buddy. I'm here to help you navigate TaskMaster. What would you like to know?",
  lesson: "To get help with lesson planning, simply type your request in the main chat. For example: 'Help me create a lesson plan for teaching fractions to 4th graders.' TaskMaster will first give you tips, then offer to create a complete lesson plan for you!",
  parent: "Need help with parent communications? Just describe the situation in the main chat. For example: 'Help me write an email to a parent about their child's behavior.' You'll get diplomatic suggestions first, then a ready-to-use email!",
  behavior: "For behavior tracking help, describe what you're dealing with. For example: 'Help me create a behavior tracking system for my classroom.' TaskMaster will provide strategies and can create tracking sheets for you!",
  rubric: "Need a grading rubric? Just ask! For example: 'Create a rubric for a 5th grade science project.' You'll get grading criteria suggestions first, then a complete rubric you can use!",
  how: "Here's how TaskMaster works: 1) Type your challenge in the chat box below. 2) TaskMaster gives you helpful tips and strategies. 3) Click 'Execute' to get ready-to-use materials. 4) Copy or download your materials!",
  chips: "The quick action chips at the bottom are shortcuts! Click any chip to instantly send that prompt to TaskMaster. They cover common teacher needs like lesson plans, parent emails, and more.",
  copy: "To copy any response, click the copy button (clipboard icon) next to the AI's message. You'll see a confirmation when it's copied!",
  download: "To download a conversation as a PDF, click the download button (arrow pointing down) next to any AI response. It creates a nicely formatted document!",
  history: "Your past conversations are saved! Click 'Your Activity History' in the sidebar to see, resume, or delete previous chats.",
  new: "To start a fresh conversation, click the 'New Chat' button with the plus icon. This clears the current chat so you can start on a new topic.",
  dark: "You can switch between light and dark mode using the theme toggle in the top right corner of the app.",
  formula: "The TaskMaster Formula shows you proven steps for solving common teaching challenges. Toggle it open to see best practices for lesson planning, parent communication, and more!",
};

function getBuddyResponse(input: string): string {
  const lower = input.toLowerCase();
  
  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
    return BUDDY_RESPONSES.greeting;
  }
  if (lower.includes("lesson") || lower.includes("plan")) {
    return BUDDY_RESPONSES.lesson;
  }
  if (lower.includes("parent") || lower.includes("email") || lower.includes("communication")) {
    return BUDDY_RESPONSES.parent;
  }
  if (lower.includes("behavior") || lower.includes("track") || lower.includes("management")) {
    return BUDDY_RESPONSES.behavior;
  }
  if (lower.includes("rubric") || lower.includes("grad") || lower.includes("assess")) {
    return BUDDY_RESPONSES.rubric;
  }
  if (lower.includes("how") || lower.includes("work") || lower.includes("use")) {
    return BUDDY_RESPONSES.how;
  }
  if (lower.includes("chip") || lower.includes("quick") || lower.includes("button")) {
    return BUDDY_RESPONSES.chips;
  }
  if (lower.includes("copy") || lower.includes("clipboard")) {
    return BUDDY_RESPONSES.copy;
  }
  if (lower.includes("download") || lower.includes("pdf") || lower.includes("save")) {
    return BUDDY_RESPONSES.download;
  }
  if (lower.includes("history") || lower.includes("past") || lower.includes("previous")) {
    return BUDDY_RESPONSES.history;
  }
  if (lower.includes("new") || lower.includes("fresh") || lower.includes("clear") || lower.includes("start")) {
    return BUDDY_RESPONSES.new;
  }
  if (lower.includes("dark") || lower.includes("light") || lower.includes("theme") || lower.includes("mode")) {
    return BUDDY_RESPONSES.dark;
  }
  if (lower.includes("formula") || lower.includes("guide") || lower.includes("tips")) {
    return BUDDY_RESPONSES.formula;
  }
  
  return "I'm not sure about that, but I can help you with: lesson planning, parent emails, behavior tracking, grading rubrics, or how to use TaskMaster features. What would you like to know?";
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
              <h3 className="text-white font-semibold text-sm">TM Buddy</h3>
              <p className="text-indigo-200 text-xs">Your navigation helper</p>
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
