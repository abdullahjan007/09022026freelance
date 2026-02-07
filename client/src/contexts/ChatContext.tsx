import { createContext, useContext, useState, ReactNode } from "react";

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

interface ChatContextType {
    messages: Message[];
    setMessages: (messages: Message[]) => void;
    handleNewChat: () => void;
    currentConversationId: string | null;
    setCurrentConversationId: (id: string | null) => void;
    conversationHistory: Conversation[];
    setConversationHistory: (history: Conversation[]) => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
    const [conversationHistory, setConversationHistory] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleNewChat = () => {
        setMessages([]);
        setCurrentConversationId(null);
        setIsLoading(false);
    };

    return (
        <ChatContext.Provider
            value={{
                messages,
                setMessages,
                handleNewChat,
                currentConversationId,
                setCurrentConversationId,
                conversationHistory,
                setConversationHistory,
                isLoading,
                setIsLoading,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error("useChat must be used within ChatProvider");
    }
    return context;
}
