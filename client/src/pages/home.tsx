import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Send, Info, Sparkles, Check, MessageCircle, Eye, EyeOff, RotateCcw, Zap, Lightbulb, Package, History, ChevronUp, Trash2, Copy, Download, CheckCircle, ThumbsUp, ThumbsDown, Share2, RefreshCw, MoreHorizontal, ExternalLink, Loader2, ArrowRight, ClipboardCheck, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import jsPDF from "jspdf";
import { TMBuddy } from "@/components/tm-buddy";
import { MermaidDiagram } from "@/components/mermaid-diagram";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
}

const QUICK_ACTIONS = [
  { label: "Lesson planning", prompt: "My problem is that I struggle to create engaging lesson plans that keep all my students interested. I need help to design interactive lessons that work for different learning styles." },
  { label: "Parent emails", prompt: "My problem is that I find it difficult to write professional emails to parents about sensitive topics. I need help to communicate student concerns diplomatically while maintaining a positive relationship." },
  { label: "Behavior tracking", prompt: "My problem is that some students are frequently disruptive and it's affecting the whole class. I need help to implement an effective behavior tracking and management system." },
  { label: "Grading rubrics", prompt: "My problem is that my current grading feels inconsistent and students question the fairness. I need help to develop clear, comprehensive rubrics that students can understand." },
];

const STORAGE_KEY = "taskmaster_history";

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getStoredHistory(): Conversation[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveToStorage(conversations: Conversation[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch {
    console.error("Failed to save to localStorage");
  }
}

function extractTitle(messages: Message[]): string {
  const firstUserMessage = messages.find(m => m.role === "user");
  if (firstUserMessage) {
    const content = firstUserMessage.content;
    const cleaned = content.replace(/My problem is that /i, "").replace(/I need help to /i, "");
    return cleaned.length > 50 ? cleaned.substring(0, 50) + "..." : cleaned;
  }
  return "New Conversation";
}

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFormula, setShowFormula] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [awaitingExecution, setAwaitingExecution] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [likedMessages, setLikedMessages] = useState<Set<number>>(new Set());
  const [dislikedMessages, setDislikedMessages] = useState<Set<number>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const handleLike = (index: number) => {
    setLikedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
        setDislikedMessages(prevDislikes => {
          const newDislikes = new Set(prevDislikes);
          newDislikes.delete(index);
          return newDislikes;
        });
      }
      return newSet;
    });
    toast({
      title: likedMessages.has(index) ? "Feedback removed" : "Thanks for your feedback!",
      description: likedMessages.has(index) ? "" : "We appreciate you letting us know this was helpful.",
    });
  };

  const handleDislike = (index: number) => {
    setDislikedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
        setLikedMessages(prevLikes => {
          const newLikes = new Set(prevLikes);
          newLikes.delete(index);
          return newLikes;
        });
      }
      return newSet;
    });
    toast({
      title: dislikedMessages.has(index) ? "Feedback removed" : "Thanks for your feedback!",
      description: dislikedMessages.has(index) ? "" : "We'll work on improving our responses.",
    });
  };

  const handleShare = async (text: string) => {
    const cleanText = text
      .replace(/---GUIDANCE_COMPLETE---/g, "")
      .replace(/---EXECUTION_START---/g, "")
      .trim();

    if (navigator.share) {
      try {
        await navigator.share({
          title: "TaskMaster Response",
          text: cleanText,
        });
      } catch {
        await navigator.clipboard.writeText(cleanText);
        toast({
          title: "Copied to clipboard!",
          description: "Ready to share",
        });
      }
    } else {
      await navigator.clipboard.writeText(cleanText);
      toast({
        title: "Copied to clipboard!",
        description: "Ready to share",
      });
    }
  };

  const handleRegenerate = async (messageIndex: number) => {
    const userMessageIndex = messageIndex - 1;
    if (userMessageIndex >= 0 && messages[userMessageIndex]?.role === "user") {
      const userMessage = messages[userMessageIndex].content;
      const trimmedMessages = messages.slice(0, userMessageIndex);
      setMessages(trimmedMessages);
      setTimeout(() => {
        sendMessage(userMessage, trimmedMessages);
      }, 100);
    }
  };

  const copyToClipboard = async (text: string, index: number) => {
    const cleanText = text
      .replace(/---GUIDANCE_COMPLETE---/g, "")
      .replace(/---EXECUTION_START---/g, "")
      .trim();
    
    try {
      await navigator.clipboard.writeText(cleanText);
      setCopiedIndex(index);
      toast({
        title: "Copied!",
        description: "Content copied to clipboard",
      });
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const downloadResponseAsPdf = (content: string) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    let yPosition = 20;

    const cleanContent = content
      .replace(/---GUIDANCE_COMPLETE---/g, "")
      .replace(/---EXECUTION_START---/g, "")
      .replace(/\[TITLE\]/g, "")
      .replace(/\[\/TITLE\]/g, "")
      .replace(/\[INTRO\]/g, "")
      .replace(/\[\/INTRO\]/g, "")
      .replace(/\[STEPS\]/g, "")
      .replace(/\[\/STEPS\]/g, "")
      .replace(/\[STEP\]/g, "")
      .replace(/\[\/STEP\]/g, "")
      .replace(/\[SECTION\]/g, "")
      .replace(/\[\/SECTION\]/g, "")
      .replace(/\*/g, "")
      .replace(/#/g, "")
      .trim();

    doc.setFontSize(18);
    doc.setTextColor(20, 184, 166);
    doc.text("TaskMaster Response", margin, yPosition);
    yPosition += 15;

    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(new Date().toLocaleDateString(), margin, yPosition);
    yPosition += 15;

    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    const lines = doc.splitTextToSize(cleanContent, maxWidth);
    
    for (const line of lines) {
      if (yPosition > 280) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, margin, yPosition);
      yPosition += 5;
    }

    doc.save("taskmaster-response.pdf");
    toast({
      title: "Downloaded!",
      description: "Response saved as PDF",
    });
  };

  useEffect(() => {
    setConversationHistory(getStoredHistory());
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === "assistant" && lastMessage.content.includes("---GUIDANCE_COMPLETE---")) {
      setAwaitingExecution(true);
    } else if (lastMessage?.role === "assistant" && lastMessage.content.includes("---EXECUTION_START---")) {
      setAwaitingExecution(false);
    }
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0 && currentConversationId && !isLoading) {
      setConversationHistory(prevHistory => {
        const existingIndex = prevHistory.findIndex(c => c.id === currentConversationId);
        let updatedHistory: Conversation[];
        
        if (existingIndex >= 0) {
          updatedHistory = [...prevHistory];
          updatedHistory[existingIndex] = {
            ...updatedHistory[existingIndex],
            messages,
            title: extractTitle(messages),
          };
        } else {
          updatedHistory = [{
            id: currentConversationId,
            title: extractTitle(messages),
            messages,
            createdAt: new Date().toISOString(),
          }, ...prevHistory];
        }
        
        saveToStorage(updatedHistory);
        return updatedHistory;
      });
    }
  }, [messages, currentConversationId, isLoading]);

  const sendMessage = async (messageText: string, existingMessages?: Message[]) => {
    if (!messageText.trim() || isLoading) return;

    if (!currentConversationId) {
      setCurrentConversationId(generateId());
    }

    const baseMessages = existingMessages ?? messages;

    setInput("");
    setAwaitingExecution(false);
    setMessages([...baseMessages, { role: "user", content: messageText }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          history: baseMessages,
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                assistantMessage += data.content;
                setMessages((prev) => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = {
                    role: "assistant",
                    content: assistantMessage,
                  };
                  return newMessages;
                });
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    await sendMessage(input);
  };

  const handleQuickAction = (action: typeof QUICK_ACTIONS[0]) => {
    setInput(action.prompt);
    inputRef.current?.focus();
  };

  const handleExecute = () => {
    sendMessage("Yes, please provide assistance beyond suggestions. Create the materials for me.");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput("");
    setAwaitingExecution(false);
    setCurrentConversationId(null);
  };

  const handleLoadConversation = (conversation: Conversation) => {
    setMessages(conversation.messages);
    setCurrentConversationId(conversation.id);
    setShowHistory(false);
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    if (lastMessage?.role === "assistant" && lastMessage.content.includes("---GUIDANCE_COMPLETE---")) {
      setAwaitingExecution(true);
    } else {
      setAwaitingExecution(false);
    }
  };

  const handleDeleteConversation = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = conversationHistory.filter(c => c.id !== conversationId);
    setConversationHistory(updated);
    saveToStorage(updated);
    if (currentConversationId === conversationId) {
      handleNewChat();
    }
  };

  const parseStructuredContent = (content: string) => {
    const titleMatch = content.match(/\[TITLE\]([\s\S]*?)\[\/TITLE\]/);
    const introMatch = content.match(/\[INTRO\]([\s\S]*?)\[\/INTRO\]/);
    const stepsMatch = content.match(/\[STEPS\]([\s\S]*?)\[\/STEPS\]/);
    const websitesMatch = content.match(/\[WEBSITES\]([\s\S]*?)\[\/WEBSITES\]/);
    
    const steps: string[] = [];
    if (stepsMatch) {
      const stepsContent = stepsMatch[1];
      const stepRegex = /\[STEP\]([\s\S]*?)\[\/STEP\]/g;
      let match;
      while ((match = stepRegex.exec(stepsContent)) !== null) {
        steps.push(match[1].trim());
      }
    }

    const websites: { name: string; url: string }[] = [];
    if (websitesMatch) {
      const websitesContent = websitesMatch[1];
      const websiteRegex = /\[WEBSITE\]([\s\S]*?)\[\/WEBSITE\]/g;
      let match;
      while ((match = websiteRegex.exec(websitesContent)) !== null) {
        const parts = match[1].trim().split('|');
        if (parts.length >= 2) {
          websites.push({ name: parts[0].trim(), url: parts[1].trim() });
        }
      }
    }

    const sections: { title: string; content: string }[] = [];
    const sectionRegex = /\[SECTION\]([\s\S]*?)\[\/SECTION\]/g;
    let sectionMatch;
    const sectionTitles: { title: string; index: number }[] = [];
    
    while ((sectionMatch = sectionRegex.exec(content)) !== null) {
      sectionTitles.push({ title: sectionMatch[1].trim(), index: sectionMatch.index + sectionMatch[0].length });
    }
    
    for (let i = 0; i < sectionTitles.length; i++) {
      const start = sectionTitles[i].index;
      const end = i + 1 < sectionTitles.length 
        ? content.indexOf('[SECTION]', start) 
        : content.length;
      const sectionContent = content.slice(start, end === -1 ? undefined : end).trim();
      sections.push({
        title: sectionTitles[i].title,
        content: sectionContent
      });
    }

    return {
      title: titleMatch ? titleMatch[1].trim() : null,
      intro: introMatch ? introMatch[1].trim() : null,
      steps,
      websites,
      sections
    };
  };

  const formatMessage = (content: string) => {
    const hasGuidanceMarker = content.includes("---GUIDANCE_COMPLETE---");
    const hasExecutionMarker = content.includes("---EXECUTION_START---");
    
    let cleanContent = content
      .replace(/---GUIDANCE_COMPLETE---/g, "")
      .replace(/---EXECUTION_START---/g, "")
      .replace(/\[TITLE\][\s\S]*?\[\/TITLE\]/g, "")
      .replace(/\[INTRO\][\s\S]*?\[\/INTRO\]/g, "")
      .replace(/\[STEPS\][\s\S]*?\[\/STEPS\]/g, "")
      .replace(/\[WEBSITES\][\s\S]*?\[\/WEBSITES\]/g, "")
      .replace(/\[SECTION\][\s\S]*?\[\/SECTION\]/g, "")
      .trim();

    const structured = parseStructuredContent(content);
    const hasStructuredContent = structured.title || structured.intro || structured.steps.length > 0 || structured.websites.length > 0 || structured.sections.length > 0;

    return { cleanContent, isGuidance: hasGuidanceMarker, isExecution: hasExecutionMarker, structured, hasStructuredContent };
  };

  const renderContentWithMermaid = (content: string) => {
    const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
    const parts: (string | { type: 'mermaid'; code: string })[] = [];
    let lastIndex = 0;
    let match;

    while ((match = mermaidRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(content.slice(lastIndex, match.index));
      }
      parts.push({ type: 'mermaid', code: match[1].trim() });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
    }

    if (parts.length === 0) {
      return content;
    }

    return (
      <>
        {parts.map((part, i) => {
          if (typeof part === 'string') {
            return <span key={i}>{part}</span>;
          }
          return <MermaidDiagram key={i} code={part.code} />;
        })}
      </>
    );
  };

  const renderStructuredContent = (structured: ReturnType<typeof parseStructuredContent>, isExecution: boolean, remainingContent: string) => {
    return (
      <div className="space-y-4">
        {structured.title && (
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              {isExecution ? (
                <Package className="h-5 w-5 text-indigo-500" />
              ) : (
                <Lightbulb className="h-5 w-5 text-amber-500" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              {structured.title}
            </h3>
          </div>
        )}
        
        {structured.intro && (
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            {structured.intro}
          </p>
        )}
        
        {structured.steps.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="h-4 w-4" />
              <span className="font-semibold text-sm uppercase tracking-wide">Recommended Steps</span>
            </div>
            <div className="space-y-3 pl-1">
              {structured.steps.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-medium">
                    {i + 1}
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 flex-1 pt-0.5">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {structured.websites.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Suggested Websites
            </div>
            <div className="flex flex-wrap gap-2">
              {structured.websites.map((website, i) => (
                <a
                  key={i}
                  href={website.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  data-testid={`link-website-${i}`}
                >
                  {website.name}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ))}
            </div>
          </div>
        )}

        {structured.sections.length > 0 && (
          <div className="space-y-4">
            {structured.sections.map((section, i) => (
              <div key={i} className="space-y-2">
                <h4 className="font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-1">
                  {section.title}
                </h4>
                <div className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap pl-2">
                  {renderContentWithMermaid(section.content)}
                </div>
              </div>
            ))}
          </div>
        )}

        {remainingContent && !structured.title && !structured.steps.length && (
          <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">
            {renderContentWithMermaid(remainingContent)}
          </div>
        )}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
      {/* Header */}
      <header className="border-b bg-white dark:bg-slate-900 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col items-center gap-1">
          {/* Logo with Continuous Rotation Animation */}
          <motion.img 
            src="/logo.png" 
            alt="TeacherBuddy" 
            className="h-20 object-contain"
            data-testid="img-logo"
            animate={{ 
              rotateY: [0, 180, 360],
            }}
            transition={{ 
              duration: 4,
              ease: "easeInOut",
              repeat: Infinity,
            }}
          />
          
          {/* Navigation */}
          <nav className="flex items-center gap-4 md:gap-8 text-sm font-bold text-slate-700 dark:text-slate-300 mt-6">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
              data-testid="button-history"
            >
              Your Search History
            </button>
            <Link href="/feedback">
              <span className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors cursor-pointer flex items-center gap-1" data-testid="link-feedback-assistant">
                <ClipboardCheck className="h-4 w-4" />
                Feedback Assistant
              </span>
            </Link>
            <Link href="/planner">
              <span className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors cursor-pointer flex items-center gap-1" data-testid="link-planner">
                <Calendar className="h-4 w-4" />
                Personal Planner
              </span>
            </Link>
            {messages.length > 0 && (
              <button 
                onClick={handleNewChat}
                className="text-orange-500 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300 transition-colors"
                data-testid="button-new-chat"
              >
                New Chat
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Activity History Panel */}
      {showHistory && (
        <div className="border-b bg-white dark:bg-slate-900 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <History className="h-4 w-4" />
                Your Activity History
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(false)}
                data-testid="button-close-history"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            </div>
            {conversationHistory.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">
                No conversations yet. Start chatting to build your history!
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {conversationHistory.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => handleLoadConversation(conversation)}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      currentConversationId === conversation.id
                        ? "bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800"
                        : "bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                    data-testid={`history-item-${conversation.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 dark:text-slate-200 truncate">
                        {conversation.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(conversation.createdAt)} - {conversation.messages.length} messages
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleDeleteConversation(conversation.id, e)}
                      className="ml-2 text-slate-400 hover:text-red-500"
                      data-testid={`button-delete-${conversation.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-4">
        {messages.length === 0 ? (
          /* Landing View */
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 py-8">
            {/* Large Centered Logo with Animation */}
            <motion.img 
              src="/logo.png" 
              alt="TeacherBuddy" 
              className="h-32 md:h-40 object-contain"
              data-testid="img-landing-logo"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.5, 
                ease: "easeOut",
              }}
              whileInView={{
                scale: [1, 1.03, 1],
                transition: { 
                  duration: 2,
                  ease: "easeInOut",
                  times: [0, 0.5, 1],
                  repeat: 0
                }
              }}
            />
            
            {/* Main Heading */}
            <h1 className="text-2xl md:text-3xl font-bold text-purple-600 dark:text-purple-400">
              How can I support you today?
            </h1>
            
            {/* Subtitle */}
            <p className="text-slate-600 dark:text-slate-400 max-w-lg">
              Your AI-powered teaching assistant for lesson plans, communication, and classroom support.
            </p>
            
            {/* Input Field with Arrow Button */}
            <div className="w-full max-w-xl">
              <div className="relative flex items-center">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="How can TeacherBuddy help you today?"
                  className="w-full py-4 px-5 pr-14 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-0 focus:outline-none resize-none min-h-[56px] max-h-[120px] text-slate-800 dark:text-slate-200"
                  rows={1}
                  data-testid="input-chat-message-landing"
                />
                <button
                  onClick={() => handleSubmit()}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 p-2 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg"
                  data-testid="button-execute-landing"
                >
                  <ArrowRight className="h-5 w-5 text-slate-700 dark:text-slate-200" />
                </button>
              </div>
            </div>
            
            {/* Popular Teacher Tasks */}
            <div className="space-y-3 pt-4">
              <p className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                Popular Teacher Tasks
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  { label: "Lesson Planning", prompt: "Help me create an engaging lesson plan" },
                  { label: "Email Drafting", prompt: "Help me write a professional email to parents" },
                  { label: "Grading Rubrics", prompt: "Help me create a grading rubric" },
                  { label: "Behavior Tracking", prompt: "Help me set up a behavior tracking system" },
                  { label: "Visual Diagrams", prompt: "Create a visual diagram or flowchart" }
                ].map((chip) => (
                  <button
                    key={chip.label}
                    onClick={() => {
                      setInput(chip.prompt);
                      inputRef.current?.focus();
                    }}
                    className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    data-testid={`chip-${chip.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg pt-4">
              TeacherBuddy is your assistant. Always review AI-generated materials before using them in the classroom. Verify the accuracy of AI-generated content by TeacherBuddy.
            </p>
          </div>
        ) : (
          /* Chat View */
          <div className="flex-1 overflow-y-auto space-y-4 pb-4">
            {messages.map((message, index) => {
              const { cleanContent, isGuidance, isExecution, structured, hasStructuredContent } = formatMessage(message.content);
              
              return (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] ${
                      message.role === "user"
                        ? "bg-indigo-500 text-white rounded-2xl px-4 py-3"
                        : ""
                    }`}
                    data-testid={`message-${message.role}-${index}`}
                  >
                    {message.role === "assistant" ? (
                      <div className="space-y-3 group">
                        {/* Message content card */}
                        <div className={`rounded-2xl px-5 py-4 ${
                          isExecution 
                            ? "bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800" 
                            : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        }`}>
                          {hasStructuredContent ? (
                            renderStructuredContent(structured, isExecution, cleanContent)
                          ) : (
                            <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">{cleanContent}</div>
                          )}
                        </div>
                        {/* Action buttons row - subtle by default, prominent on hover */}
                        <div className="flex items-center gap-1 pt-1 opacity-40 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(message.content, index)}
                            className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                            data-testid={`button-copy-${index}`}
                          >
                            {copiedIndex === index ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => downloadResponseAsPdf(message.content)}
                            className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                            data-testid={`button-download-${index}`}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleLike(index)}
                            className={`${likedMessages.has(index) ? 'text-indigo-500' : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'}`}
                            data-testid={`button-like-${index}`}
                          >
                            <ThumbsUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDislike(index)}
                            className={`${dislikedMessages.has(index) ? 'text-red-500' : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'}`}
                            data-testid={`button-dislike-${index}`}
                          >
                            <ThumbsDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleShare(message.content)}
                            className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                            data-testid={`button-share-${index}`}
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRegenerate(index)}
                            disabled={isLoading}
                            className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                            data-testid={`button-regenerate-${index}`}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                                data-testid={`button-more-${index}`}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              <DropdownMenuItem onClick={() => copyToClipboard(message.content, index)}>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy text
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleShare(message.content)}>
                                <Share2 className="h-4 w-4 mr-2" />
                                Share
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRegenerate(index)} disabled={isLoading}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Regenerate
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    )}
                  </div>
                </div>
              );
            })}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex justify-start">
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 border border-orange-200 dark:border-orange-700 rounded-2xl px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 text-orange-600 dark:text-orange-400 animate-spin" />
                    <span className="text-orange-700 dark:text-orange-300 font-medium">Working for You...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Execute Button - shown when awaiting execution */}
        {awaitingExecution && !isLoading && (
          <div className="mb-4 flex justify-center">
            <Button
              onClick={handleExecute}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg px-6 py-3 text-lg gap-2"
              data-testid="button-execute"
            >
              <Zap className="h-5 w-5" />
              Would You Like TaskMaster to Execute?
            </Button>
          </div>
        )}

        {/* Input Area - Only show in chat view */}
        {messages.length > 0 && (
          <div className="pt-4 pb-4 space-y-2">
            {/* Chat Input */}
            <div className="relative">
              <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg overflow-hidden">
                <MessageCircle className="h-5 w-5 text-muted-foreground ml-4 flex-shrink-0" />
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder=""
                  className="flex-1 py-4 px-2 bg-transparent border-0 focus:ring-0 focus:outline-none resize-none min-h-[67px] max-h-[200px] text-slate-800 dark:text-slate-200 placeholder:text-muted-foreground"
                  rows={1}
                  data-testid="input-chat-message"
                />
                <Button
                  onClick={() => handleSubmit()}
                  disabled={!input.trim() || isLoading}
                  className="mr-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-4"
                  data-testid="button-send-message"
                >
                  <Send className="h-4 w-4 mr-1" />
                  Send
                </Button>
              </div>
            </div>

            {/* Consolidated Footer */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Online</span>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <span data-testid="text-disclaimer">AI tool - double check facts</span>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-slate-900 py-6">
        <div className="max-w-5xl mx-auto px-4 flex flex-col items-center gap-4">
          {/* Footer Links */}
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
          </nav>
          
          {/* Footer Logo */}
          <img 
            src="/logo.png" 
            alt="TeacherBuddy" 
            className="h-16 object-contain opacity-80"
            data-testid="img-footer-logo"
          />
        </div>
      </footer>
      
      {/* TM Buddy Navigation Helper */}
      <TMBuddy />
    </div>
  );
}
