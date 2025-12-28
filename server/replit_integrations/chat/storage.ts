// Simple in-memory chat storage for the AI teacher support agent
// No database required - just a simple interface for the chat

export interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export interface Conversation {
  id: number;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
}

export interface IChatStorage {
  getConversation(id: number): Promise<Conversation | undefined>;
  getAllConversations(): Promise<Conversation[]>;
  createConversation(title: string): Promise<Conversation>;
  deleteConversation(id: number): Promise<void>;
  getMessagesByConversation(conversationId: number): Promise<ChatMessage[]>;
  createMessage(conversationId: number, role: "user" | "assistant", content: string): Promise<ChatMessage>;
}

class MemoryChatStorage implements IChatStorage {
  private conversations: Map<number, Conversation> = new Map();
  private nextConversationId = 1;
  private nextMessageId = 1;

  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async getAllConversations(): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async createConversation(title: string): Promise<Conversation> {
    const conversation: Conversation = {
      id: this.nextConversationId++,
      title,
      messages: [],
      createdAt: new Date(),
    };
    this.conversations.set(conversation.id, conversation);
    return conversation;
  }

  async deleteConversation(id: number): Promise<void> {
    this.conversations.delete(id);
  }

  async getMessagesByConversation(conversationId: number): Promise<ChatMessage[]> {
    const conversation = this.conversations.get(conversationId);
    return conversation?.messages || [];
  }

  async createMessage(
    conversationId: number,
    role: "user" | "assistant",
    content: string
  ): Promise<ChatMessage> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }
    const message: ChatMessage = {
      id: this.nextMessageId++,
      role,
      content,
      createdAt: new Date(),
    };
    conversation.messages.push(message);
    return message;
  }
}

export const chatStorage: IChatStorage = new MemoryChatStorage();
