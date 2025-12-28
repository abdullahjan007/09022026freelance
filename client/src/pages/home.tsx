import { useState, useRef, useEffect } from "react";
import { Send, Info, Sparkles, Check, MessageCircle, Eye, EyeOff, RotateCcw, Zap, Lightbulb, Package, History, ChevronUp, Trash2, Copy, Download, CheckCircle, ThumbsUp, ThumbsDown, Share2, RefreshCw, MoreHorizontal } from "lucide-react";
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
  const [showFormula, setShowFormula] = useState(true);
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

  const downloadAsPdf = () => {
    if (messages.length === 0) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    let yPosition = 20;

    doc.setFontSize(18);
    doc.setTextColor(20, 184, 166);
    doc.text("TaskMaster Conversation", margin, yPosition);
    yPosition += 15;

    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(new Date().toLocaleDateString(), margin, yPosition);
    yPosition += 15;

    messages.forEach((message) => {
      const cleanContent = message.content
        .replace(/---GUIDANCE_COMPLETE---/g, "")
        .replace(/---EXECUTION_START---/g, "")
        .trim();

      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(11);
      doc.setTextColor(message.role === "user" ? 20 : 100, message.role === "user" ? 184 : 100, message.role === "user" ? 166 : 100);
      doc.text(message.role === "user" ? "You:" : "TaskMaster:", margin, yPosition);
      yPosition += 7;

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
      yPosition += 10;
    });

    doc.save("taskmaster-conversation.pdf");
    toast({
      title: "Downloaded!",
      description: "PDF saved to your device",
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
    sendMessage(action.prompt);
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
    
    const steps: string[] = [];
    if (stepsMatch) {
      const stepsContent = stepsMatch[1];
      const stepRegex = /\[STEP\]([\s\S]*?)\[\/STEP\]/g;
      let match;
      while ((match = stepRegex.exec(stepsContent)) !== null) {
        steps.push(match[1].trim());
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
      .replace(/\[SECTION\][\s\S]*?\[\/SECTION\]/g, "")
      .trim();

    const structured = parseStructuredContent(content);
    const hasStructuredContent = structured.title || structured.intro || structured.steps.length > 0 || structured.sections.length > 0;

    return { cleanContent, isGuidance: hasGuidanceMarker, isExecution: hasExecutionMarker, structured, hasStructuredContent };
  };

  const renderStructuredContent = (structured: ReturnType<typeof parseStructuredContent>, isExecution: boolean, remainingContent: string) => {
    return (
      <div className="space-y-4">
        {structured.title && (
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              {isExecution ? (
                <Package className="h-5 w-5 text-teal-500" />
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
            <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400">
              <Sparkles className="h-4 w-4" />
              <span className="font-semibold text-sm uppercase tracking-wide">Recommended Steps</span>
            </div>
            <div className="space-y-3 pl-1">
              {structured.steps.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center text-sm font-medium">
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

        {structured.sections.length > 0 && (
          <div className="space-y-4">
            {structured.sections.map((section, i) => (
              <div key={i} className="space-y-2">
                <h4 className="font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-1">
                  {section.title}
                </h4>
                <div className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap pl-2">
                  {section.content}
                </div>
              </div>
            ))}
          </div>
        )}

        {remainingContent && !structured.title && !structured.steps.length && (
          <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">
            {remainingContent}
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-teal-50/50 to-white dark:from-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600">
              <Check className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-teal-700 dark:text-teal-400">
                TaskMaster
              </h1>
              <p className="text-xs text-teal-600/70 dark:text-teal-500/70 uppercase tracking-wide">
                The Teacher's Booster
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowHistory(!showHistory)}
              className="text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
              data-testid="button-history"
            >
              <History className="h-4 w-4 mr-1" />
              History
              {conversationHistory.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {conversationHistory.length}
                </Badge>
              )}
            </Button>
            {messages.length > 0 && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={downloadAsPdf}
                  className="text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                  data-testid="button-download-pdf"
                >
                  <Download className="h-4 w-4 mr-1" />
                  PDF
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleNewChat}
                  className="text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800"
                  data-testid="button-new-chat"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  New Chat
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="text-center py-1 text-sm text-muted-foreground border-t bg-muted/30">
          TaskMaster - Teacher Support Agent
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
                        ? "bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800"
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
      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-8">
        {messages.length === 0 ? (
          /* Landing View */
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
            {/* Hero Icon */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                <Check className="h-12 w-12 text-teal-500" />
              </div>
              <Sparkles className="absolute -top-1 -right-1 h-6 w-6 text-amber-400" />
            </div>

            {/* Hero Text */}
            <div className="space-y-4 max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100">
                Dear Busy Teacher,
              </h2>
              <p className="text-xl text-muted-foreground">
                Focus on the classroom. Let AI handle the prep.
              </p>
            </div>

            {/* Call to Action */}
            <p className="text-teal-600 dark:text-teal-400 font-medium text-xl">
              What help do you need now?
            </p>

            {/* The TaskMaster Formula Card */}
            <Card className="w-full max-w-3xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Info className="h-4 w-4" />
                    <span className="uppercase tracking-wide font-medium">The TaskMaster Formula</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFormula(!showFormula)}
                    data-testid="button-preview"
                  >
                    {showFormula ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-1" />
                        Hide
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-1" />
                        Show
                      </>
                    )}
                  </Button>
                </div>

                {showFormula && (
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Problem + Solution */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-teal-500 hover:bg-teal-500 text-white">1</Badge>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">Problem + Solution</span>
                      </div>
                      <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4 space-y-2">
                        <p className="text-slate-700 dark:text-slate-300">"My problem is ___."</p>
                        <p className="text-slate-700 dark:text-slate-300">"I need help to ___."</p>
                      </div>
                    </div>

                    {/* Example */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-amber-500 hover:bg-amber-500 text-white">2</Badge>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">Example</span>
                      </div>
                      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
                        <p className="text-slate-700 dark:text-slate-300 text-sm">
                          "My problem is that my grade 9 students of Biology don't understand my feedback comments. I need help rewriting it in simple, friendly English."
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
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
                        ? "bg-teal-500 text-white rounded-2xl px-4 py-3"
                        : ""
                    }`}
                    data-testid={`message-${message.role}-${index}`}
                  >
                    {message.role === "assistant" ? (
                      <div className="space-y-3">
                        {/* Message content card */}
                        <div className={`rounded-2xl px-5 py-4 ${
                          isExecution 
                            ? "bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800" 
                            : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        }`}>
                          {hasStructuredContent ? (
                            renderStructuredContent(structured, isExecution, cleanContent)
                          ) : (
                            <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">{cleanContent}</div>
                          )}
                        </div>
                        {/* Action buttons row */}
                        <div className="flex items-center gap-1 pt-1">
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
                            onClick={() => handleLike(index)}
                            className={`${likedMessages.has(index) ? 'text-teal-500' : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'}`}
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
                <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
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
              className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg px-6 py-3 text-lg gap-2"
              data-testid="button-execute"
            >
              <Zap className="h-5 w-5" />
              Would You Like Assistance Beyond Suggestions?
            </Button>
          </div>
        )}

        {/* Input Area */}
        <div className="mt-auto pt-4 space-y-3">
          {/* Chat Input */}
          <div className="relative">
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg overflow-hidden">
              <MessageCircle className="h-5 w-5 text-muted-foreground ml-4 flex-shrink-0" />
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g., 'My problem is... I need help to...'"
                className="flex-1 py-4 px-2 bg-transparent border-0 focus:ring-0 focus:outline-none resize-none min-h-[56px] max-h-[200px] text-slate-800 dark:text-slate-200 placeholder:text-muted-foreground"
                rows={1}
                data-testid="input-chat-message"
              />
              <Button
                onClick={() => handleSubmit()}
                disabled={!input.trim() || isLoading}
                className="mr-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl px-4"
                data-testid="button-send-message"
              >
                <Send className="h-4 w-4 mr-1" />
                Send
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {QUICK_ACTIONS.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction(action)}
                disabled={isLoading}
                className="rounded-full text-sm border-slate-300 dark:border-slate-600"
                data-testid={`button-quick-${action.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {action.label}
              </Button>
            ))}
          </div>

          {/* Status Footer */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="font-medium">TaskMaster Agent Online</span>
            <span className="text-slate-400 dark:text-slate-600">|</span>
            <span className="italic">Helping you focus on what matters: your students.</span>
          </div>
        </div>
      </main>
    </div>
  );
}
