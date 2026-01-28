import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  RefreshCw, 
  FileText, 
  Calendar, 
  SortAsc, 
  SortDesc, 
  Trash2, 
  Menu, 
  X,
  BookOpen,
  ClipboardCheck,
  History,
  Download,
  Search,
  UserPlus
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface LibraryEntry {
  id: string;
  title: string;
  filename: string;
  date: string;
  preview: string;
  pdfData?: string;
}

export default function Library() {
  const [entries, setEntries] = useState<LibraryEntry[]>([]);
  const [sortBy, setSortBy] = useState<"date" | "name">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadLibrary();
  }, []);

  const loadLibrary = () => {
    try {
      const libraryKey = "teacherbuddy_library";
      const stored = localStorage.getItem(libraryKey);
      if (stored) {
        setEntries(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load library from localStorage:", error);
      setEntries([]);
    }
  };

  const deleteEntry = (id: string) => {
    const libraryKey = "teacherbuddy_library";
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    localStorage.setItem(libraryKey, JSON.stringify(updated));
  };

  const downloadPdf = (entry: LibraryEntry) => {
    if (entry.pdfData) {
      const link = document.createElement('a');
      link.href = entry.pdfData;
      link.download = entry.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const filteredEntries = entries.filter(entry => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return entry.title.toLowerCase().includes(query) || 
           entry.preview.toLowerCase().includes(query);
  });

  const sortedEntries = [...filteredEntries].sort((a, b) => {
    if (sortBy === "date") {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    } else {
      const comparison = a.title.localeCompare(b.title);
      return sortOrder === "desc" ? -comparison : comparison;
    }
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleSort = (type: "date" | "name") => {
    if (sortBy === type) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(type);
      setSortOrder("desc");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
      <header className="bg-white dark:bg-slate-900 sticky top-0 z-50 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between gap-2">
          <Link href="/">
            <Button
              size="sm"
              className="bg-[#6C4EE3]"
              data-testid="button-new-chat-header"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              New Chat
            </Button>
          </Link>
          
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-[#6C4EE3]" data-testid="text-logo">TeacherBuddy</span>
          </div>
          
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
            <Button 
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-menu-toggle"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
        
        {mobileMenuOpen && (
          <nav className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <Link href="/">
              <span 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover-elevate transition-colors flex items-center gap-2 cursor-pointer"
                data-testid="link-ai-chat"
              >
                <History className="h-4 w-4" />
                AI Chat
              </span>
            </Link>
            <Link href="/feedback">
              <span 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover-elevate transition-colors flex items-center gap-2 cursor-pointer"
                data-testid="link-feedback-assistant"
              >
                <ClipboardCheck className="h-4 w-4" />
                Feedback Assistant
              </span>
            </Link>
            <Link href="/planner">
              <span 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover-elevate transition-colors flex items-center gap-2 cursor-pointer"
                data-testid="link-planner"
              >
                <Calendar className="h-4 w-4" />
                My Calendar
              </span>
            </Link>
            <span 
              className="block px-3 py-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-[#6C4EE3] flex items-center gap-2"
              data-testid="link-library-active"
            >
              <BookOpen className="h-4 w-4" />
              Your Saved PDFs
            </span>
          </nav>
        )}
      </header>

      <main className="flex-1 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2" data-testid="text-page-title">
              <BookOpen className="h-6 w-6 text-[#6C4EE3]" />
              Your Saved PDFs
            </h1>
            <div className="flex items-center gap-2">
              <Button
                variant={sortBy === "name" ? "default" : "outline"}
                size="sm"
                onClick={() => toggleSort("name")}
                className={sortBy === "name" ? "bg-[#6C4EE3]" : ""}
                data-testid="button-sort-name"
              >
                <FileText className="h-4 w-4 mr-1" />
                Name
                {sortBy === "name" && (sortOrder === "asc" ? <SortAsc className="h-3 w-3 ml-1" /> : <SortDesc className="h-3 w-3 ml-1" />)}
              </Button>
              <Button
                variant={sortBy === "date" ? "default" : "outline"}
                size="sm"
                onClick={() => toggleSort("date")}
                className={sortBy === "date" ? "bg-[#6C4EE3]" : ""}
                data-testid="button-sort-date"
              >
                <Calendar className="h-4 w-4 mr-1" />
                Date
                {sortBy === "date" && (sortOrder === "asc" ? <SortAsc className="h-3 w-3 ml-1" /> : <SortDesc className="h-3 w-3 ml-1" />)}
              </Button>
            </div>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search saved PDFs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-base"
              data-testid="input-search-library"
            />
          </div>

          {entries.length === 0 ? (
            <Card className="p-8 text-center" data-testid="card-empty-state">
              <BookOpen className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2" data-testid="text-empty-title">
                Your Personal Library
              </h3>
              <p className="text-slate-500 dark:text-slate-400" data-testid="text-empty-description">
                All PDFs you download in TeacherBuddy, are also saved here. Convenience to let you find your resources quickly and easily.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {sortedEntries.map((entry) => (
                <Card 
                  key={entry.id} 
                  className="p-4 hover-elevate"
                  data-testid={`card-library-${entry.id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="h-4 w-4 text-[#6C4EE3] flex-shrink-0" />
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100 truncate" data-testid={`text-title-${entry.id}`}>
                          {entry.title}
                        </h3>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-2" data-testid={`text-date-${entry.id}`}>
                        {formatDate(entry.date)}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2" data-testid={`text-preview-${entry.id}`}>
                        {entry.preview}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {entry.pdfData && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => downloadPdf(entry)}
                          data-testid={`button-download-${entry.id}`}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteEntry(entry.id)}
                        className="text-slate-400"
                        data-testid={`button-delete-${entry.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <p className="text-center text-sm text-slate-400 dark:text-slate-500 mt-6" data-testid="text-document-count">
            {entries.length} {entries.length === 1 ? "document" : "documents"} saved
          </p>
        </div>
      </main>
    </div>
  );
}