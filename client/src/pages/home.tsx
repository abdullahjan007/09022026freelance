import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Send, Info, Sparkles, Check, MessageCircle, Eye, EyeOff, RotateCcw, Zap, Lightbulb, Package, History, ChevronUp, Trash2, Copy, Download, CheckCircle, ThumbsUp, ThumbsDown, Share2, RefreshCw, MoreHorizontal, ExternalLink, Loader2, ArrowRight, ClipboardCheck, Calendar, X, Bot, Menu, BookOpen, Pencil, UserPlus } from "lucide-react";
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
import { MermaidDiagram } from "@/components/mermaid-diagram";
import teacherBuddyLogo from "@assets/ATeacherBuddy_logo_on_smartphone_outline-3_1768414106629.png";

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
  const inputRef = useRef<HTMLInputElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
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
          title: "TeacherBuddy Response",
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

    // Extract websites for Works Cited section (MLA9 format)
    const websitesMatch = content.match(/\[WEBSITES\]([\s\S]*?)\[\/WEBSITES\]/);
    const websites: { name: string; url: string }[] = [];
    if (websitesMatch) {
      const websiteRegex = /\[WEBSITE\]([\s\S]*?)\[\/WEBSITE\]/g;
      let match;
      while ((match = websiteRegex.exec(websitesMatch[1])) !== null) {
        const parts = match[1].trim().split('|');
        if (parts.length >= 2) {
          websites.push({ name: parts[0].trim(), url: parts[1].trim() });
        }
      }
    }

    // Clean content - remove all markup tags and chatty AI responses
    let cleanContent = content
      .replace(/---GUIDANCE_COMPLETE---/g, "")
      .replace(/---EXECUTION_START---/g, "")
      .replace(/---EXECUTION_COMPLETE---/g, "")
      .replace(/\[TITLE\]/g, "\n\n")
      .replace(/\[\/TITLE\]/g, "\n\n")
      .replace(/\[TLDR\]/g, "\n\nQuick Summary:\n")
      .replace(/\[\/TLDR\]/g, "\n")
      .replace(/\[INTRO\]/g, "")
      .replace(/\[\/INTRO\]/g, "\n")
      .replace(/\[STEPS\]/g, "")
      .replace(/\[\/STEPS\]/g, "")
      .replace(/\[STEP\]/g, "\n")
      .replace(/\[\/STEP\]/g, "")
      .replace(/\[SECTION\]/g, "\n\n")
      .replace(/\[\/SECTION\]/g, "\n")
      .replace(/\[WEBSITES\][\s\S]*?\[\/WEBSITES\]/g, "")
      .replace(/\[RELATED\][\s\S]*?\[\/RELATED\]/g, "")
      .replace(/\*/g, "")
      .replace(/#/g, "")
      // Remove chatty questions and AI follow-up messages (captures full sentences including quotes)
      .replace(/Would you like[^]*?[.!?](?:\s|$)/gi, "")
      .replace(/Let me know[^]*?[.!?](?:\s|$)/gi, "")
      .replace(/Feel free[^]*?[.!?](?:\s|$)/gi, "")
      .replace(/Is there anything[^]*?[.!?](?:\s|$)/gi, "")
      .replace(/Just say[^]*?[.!?](?:\s|$)/gi, "")
      .replace(/If you need[^]*?[.!?](?:\s|$)/gi, "")
      .replace(/If you want[^]*?[.!?](?:\s|$)/gi, "")
      .replace(/If you'd like[^]*?[.!?](?:\s|$)/gi, "")
      .replace(/Do you want[^]*?[.!?](?:\s|$)/gi, "")
      .replace(/Should I[^]*?[.!?](?:\s|$)/gi, "")
      .replace(/What grade level[^]*?[.!?](?:\s|$)/gi, "")
      .replace(/What subject[^]*?[.!?](?:\s|$)/gi, "")
      .replace(/Your materials are[^]*?[.!?](?:\s|$)/gi, "")
      .replace(/These materials are[^]*?[.!?](?:\s|$)/gi, "")
      .replace(/This is ready[^]*?[.!?](?:\s|$)/gi, "")
      .replace(/I hope this[^]*?[.!?](?:\s|$)/gi, "")
      .replace(/Happy teaching[^]*?[.!?](?:\s|$)/gi, "")
      .replace(/Good luck[^]*?[.!?](?:\s|$)/gi, "")
      .replace(/Best of luck[^]*?[.!?](?:\s|$)/gi, "")
      .replace(/ready for printing[^]*?[.!?](?:\s|$)/gi, "")
      .replace(/ready for digital[^]*?[.!?](?:\s|$)/gi, "")
      .replace(/ready to use[^]*?[.!?](?:\s|$)/gi, "")
      .replace(/ready to go[^]*?[.!?](?:\s|$)/gi, "")
      .replace(/Can I help[^]*?[.!?](?:\s|$)/gi, "")
      .replace(/Shall I[^]*?[.!?](?:\s|$)/gi, "")
      .replace(/Want me to[^]*?[.!?](?:\s|$)/gi, "")
      .replace(/This plan includes everything[^]*?[.!?](?:\s|$)/gi, "")
      .replace(/I'll get it ready[^]*?[.!?](?:\s|$)/gi, "")
      .replace(/adjust or add anything[^]*?[.!?](?:\s|$)/gi, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    // Header: TeacherBuddy
    doc.setFontSize(18);
    doc.setTextColor(108, 78, 227);
    doc.text("TeacherBuddy", margin, yPosition);
    yPosition += 15;

    // Date
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(new Date().toLocaleDateString(), margin, yPosition);
    yPosition += 15;

    // Main content
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

    // Works Cited section (MLA9 format)
    if (websites.length > 0) {
      yPosition += 10;
      if (yPosition > 260) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(12);
      doc.setTextColor(50, 50, 50);
      doc.text("Works Cited", margin, yPosition);
      yPosition += 8;
      
      doc.setFontSize(10);
      const today = new Date();
      const accessDate = today.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
      
      for (const website of websites) {
        if (yPosition > 280) {
          doc.addPage();
          yPosition = 20;
        }
        // MLA9 format: "Title." Website Name, URL. Accessed Day Month Year.
        const citation = `"${website.name}." ${website.url}. Accessed ${accessDate}.`;
        const citationLines = doc.splitTextToSize(citation, maxWidth);
        for (const citeLine of citationLines) {
          doc.text(citeLine, margin, yPosition);
          yPosition += 5;
        }
        yPosition += 2;
      }
    }

    // Extract title for library
    const titleMatch = content.match(/\[TITLE\]([\s\S]*?)\[\/TITLE\]/);
    const pdfTitle = titleMatch ? titleMatch[1].trim() : "TeacherBuddy Response";
    const timestamp = new Date().toISOString();
    const filename = `teacherbuddy-response-${Date.now()}.pdf`;

    // Get PDF as base64 for storage
    const pdfBase64 = doc.output('datauristring');

    doc.save(filename);

    // Save to Saved PDFs in localStorage
    const libraryKey = "teacherbuddy_library";
    const existingLibrary = JSON.parse(localStorage.getItem(libraryKey) || "[]");
    const newEntry = {
      id: Date.now().toString(),
      title: pdfTitle,
      filename,
      date: timestamp,
      preview: cleanContent.slice(0, 150) + (cleanContent.length > 150 ? "..." : ""),
      pdfData: pdfBase64
    };
    existingLibrary.unshift(newEntry);
    localStorage.setItem(libraryKey, JSON.stringify(existingLibrary));

    toast({
      title: "Downloaded & Saved!",
      description: "PDF added to your Saved PDFs",
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
    const tldrMatch = content.match(/\[TLDR\]([\s\S]*?)\[\/TLDR\]/);
    const introMatch = content.match(/\[INTRO\]([\s\S]*?)\[\/INTRO\]/);
    const stepsMatch = content.match(/\[STEPS\]([\s\S]*?)\[\/STEPS\]/);
    const websitesMatch = content.match(/\[WEBSITES\]([\s\S]*?)\[\/WEBSITES\]/);
    const relatedMatch = content.match(/\[RELATED\]([\s\S]*?)\[\/RELATED\]/);
    
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

    const relatedTopics: string[] = [];
    if (relatedMatch) {
      const topics = relatedMatch[1].trim().split('|');
      topics.forEach(topic => {
        const trimmed = topic.trim();
        if (trimmed) relatedTopics.push(trimmed);
      });
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
      tldr: tldrMatch ? tldrMatch[1].trim() : null,
      intro: introMatch ? introMatch[1].trim() : null,
      steps,
      websites,
      relatedTopics,
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
      .replace(/\[TLDR\][\s\S]*?\[\/TLDR\]/g, "")
      .replace(/\[INTRO\][\s\S]*?\[\/INTRO\]/g, "")
      .replace(/\[STEPS\][\s\S]*?\[\/STEPS\]/g, "")
      .replace(/\[WEBSITES\][\s\S]*?\[\/WEBSITES\]/g, "")
      .replace(/\[RELATED\][\s\S]*?\[\/RELATED\]/g, "")
      .replace(/\[SECTION\][\s\S]*?\[\/SECTION\]/g, "")
      .trim();

    const structured = parseStructuredContent(content);
    const hasStructuredContent = structured.title || structured.tldr || structured.intro || structured.steps.length > 0 || structured.websites.length > 0 || structured.relatedTopics.length > 0 || structured.sections.length > 0;

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

  const handleRelatedTopicClick = (topic: string) => {
    if (chatInputRef.current) {
      chatInputRef.current.value = `Help me with: ${topic}`;
      chatInputRef.current.focus();
    }
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

        {structured.tldr && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">Quick Start</span>
                <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">{structured.tldr}</p>
              </div>
            </div>
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
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md text-sm hover-elevate transition-colors"
                  data-testid={`link-website-${i}`}
                >
                  {website.name}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ))}
            </div>
          </div>
        )}

        {structured.relatedTopics.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-700 mt-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 pt-2">
              You might also want help with
            </div>
            <div className="flex flex-wrap gap-2">
              {structured.relatedTopics.map((topic, i) => (
                <button
                  key={i}
                  onClick={() => handleRelatedTopicClick(topic)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-md text-sm hover-elevate transition-colors"
                  data-testid={`button-related-topic-${i}`}
                >
                  {topic}
                  <ArrowRight className="h-3 w-3" />
                </button>
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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
      {/* Mobile-First Top Navigation */}
      <header className="bg-white dark:bg-slate-900 sticky top-0 z-50 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between gap-4">
          {/* Left: New Chat Button */}
          <Button
            onClick={handleNewChat}
            size="sm"
            className="rounded-full bg-[#6C4EE3] text-white"
            data-testid="button-new-chat-header"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            New Chat
          </Button>
          
          {/* Logo Text - always centered via flex justify-between */}
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-[#6C4EE3]" data-testid="text-logo">TeacherBuddy</span>
          </div>
          
          {/* Right: Register Button + Hamburger Menu */}
          <div className="flex items-center gap-2">
            <Link href="/register">
              <Button
                size="sm"
                variant="outline"
                className="rounded-full border-[#6C4EE3] text-[#6C4EE3]"
                data-testid="button-register-header"
              >
                Register
              </Button>
            </Link>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover-elevate transition-colors"
              data-testid="button-menu-toggle"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-slate-700 dark:text-slate-300" />
              ) : (
                <Menu className="h-6 w-6 text-slate-700 dark:text-slate-300" />
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <nav className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            {/* Main Navigation - Horizontal Grid */}
            <div className="grid grid-cols-4 gap-2 px-2">
              <button 
                onClick={() => { setShowHistory(!showHistory); setMobileMenuOpen(false); }}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-slate-700 dark:text-slate-300 hover-elevate transition-colors"
                data-testid="button-history"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <History className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-xs font-medium text-center leading-tight">Chat History</span>
              </button>
              
              <Link href="/feedback">
                <span 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-slate-700 dark:text-slate-300 hover-elevate transition-colors cursor-pointer" 
                  data-testid="link-feedback-assistant"
                >
                  <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <ClipboardCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-xs font-medium text-center leading-tight">Students Grader</span>
                </span>
              </Link>
              
              <Link href="/planner">
                <span 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-slate-700 dark:text-slate-300 hover-elevate transition-colors cursor-pointer" 
                  data-testid="link-planner"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-xs font-medium text-center leading-tight">Your Calendar</span>
                </span>
              </Link>
              
              <Link href="/library">
                <span 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-slate-700 dark:text-slate-300 hover-elevate transition-colors cursor-pointer" 
                  data-testid="link-library"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="text-xs font-medium text-center leading-tight">Your Saved PDFs</span>
                </span>
              </Link>
              
              <Link href="/register">
                <span 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-slate-700 dark:text-slate-300 hover-elevate transition-colors cursor-pointer" 
                  data-testid="link-register"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <UserPlus className="h-5 w-5 text-[#6C4EE3]" />
                  </div>
                  <span className="text-xs font-medium text-center leading-tight">Register</span>
                </span>
              </Link>
            </div>
            
            {/* Quick Tasks Section */}
            <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
              <p className="px-3 pb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                Quick Tasks
              </p>
              <div className="flex flex-wrap gap-2 px-3">
                {[
                  { label: "Lesson Plan", prompt: "Help me create an engaging lesson plan", icon: Lightbulb },
                  { label: "Parent Email", prompt: "Help me write a professional email to parents", icon: MessageCircle },
                  { label: "Rubric", prompt: "Help me create a grading rubric", icon: ClipboardCheck },
                  { label: "Behavior", prompt: "Help me set up a behavior tracking system", icon: Check },
                  { label: "Diagram", prompt: "Create a visual diagram or flowchart", icon: Sparkles }
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setInput(item.prompt);
                      setMobileMenuOpen(false);
                      inputRef.current?.focus();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-medium hover-elevate transition-colors"
                    data-testid={`menu-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <item.icon className="h-3 w-3" />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            
            {messages.length > 0 && (
              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 px-3 pb-2">
                <button 
                  onClick={() => { handleNewChat(); setMobileMenuOpen(false); }}
                  className="w-full text-center py-2 rounded-lg text-[#6C4EE3] hover-elevate transition-colors flex items-center justify-center gap-2"
                  data-testid="button-new-chat"
                >
                  <RefreshCw className="h-4 w-4" />
                  New Chat
                </button>
              </div>
            )}
          </nav>
        )}
      </header>

      {/* Activity History Panel */}
      {showHistory && (
        <div className="border-b bg-white dark:bg-slate-900 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4 mb-3">
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
                    className={`flex items-center justify-between gap-2 p-3 rounded-lg cursor-pointer transition-colors ${
                      currentConversationId === conversation.id
                        ? "bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800"
                        : "bg-slate-50 dark:bg-slate-800 hover-elevate"
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
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 py-8 px-4">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex items-center justify-center -mt-8"
              data-testid="logo-container"
            >
              <img 
                src={teacherBuddyLogo} 
                alt="TeacherBuddy - Busy Teacher's Best Friend" 
                className="w-64 h-auto md:w-80"
                data-testid="img-logo"
              />
            </motion.div>
            
            {/* Main Heading */}
            <motion.h1 
              className="text-2xl md:text-3xl font-bold text-[#6C4EE3]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Busy Teacher; what do you need?
            </motion.h1>
            
            {/* Subtitle */}
            <motion.p 
              className="text-slate-500 dark:text-slate-400 max-w-md text-base"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              This digital teaching assistant helps with planning lessons, grading, communicating with parents etc. Save hours every week.
            </motion.p>
            
            {/* Input Field with Purple Arrow Button */}
            <motion.div 
              className="w-full max-w-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="relative flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                  placeholder="Ask TeacherBuddy anything…"
                  className="w-full py-4 px-5 pr-14 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-[#6C4EE3]/30 focus:border-[#6C4EE3] focus:outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                  data-testid="input-chat-message-landing"
                />
                <Button
                  onClick={() => handleSubmit()}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="absolute right-2 bg-[#6C4EE3] disabled:opacity-50 rounded-xl"
                  data-testid="button-execute-landing"
                >
                  <ArrowRight className="h-5 w-5 text-white" />
                </Button>
              </div>
            </motion.div>

            {/* Disclaimer */}
            <p className="text-xs text-slate-400 max-w-lg pt-10">
              TeacherBuddy is your assistant. Always review AI-generated materials before using them in the classroom.
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
                <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border border-green-200 dark:border-green-700 rounded-2xl px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Pencil className="h-5 w-5 text-green-600 dark:text-green-400 animate-pencil-write" />
                    <span className="text-green-700 dark:text-green-300 font-medium">Working for You...</span>
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
              className="bg-orange-500 text-white shadow-lg px-6 py-3 text-lg gap-2"
              data-testid="button-execute"
            >
              <Zap className="h-5 w-5" />
              Would You Like TeacherBuddy to Execute?
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
                  ref={chatInputRef}
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
                  className="mr-2 bg-orange-500 text-white rounded-xl px-4"
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
      
    </div>
  );
}
