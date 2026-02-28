// Simple in-memory chat storage for the AI teacher support agent
// Conversations are scoped per user via userId

export interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export interface Conversation {
  id: number;
  userId: string; // scope conversations to the user who created them
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
}

export interface IChatStorage {
  getConversation(id: number, userId: string): Promise<Conversation | undefined>;
  getAllConversations(userId: string): Promise<Conversation[]>;
  createConversation(userId: string, title: string): Promise<Conversation>;
  deleteConversation(id: number, userId: string): Promise<void>;
  getMessagesByConversation(conversationId: number, userId: string): Promise<ChatMessage[]>;
  createMessage(conversationId: number, userId: string, role: "user" | "assistant", content: string): Promise<ChatMessage>;
}

class MemoryChatStorage implements IChatStorage {
  private conversations: Map<number, Conversation> = new Map();
  private nextConversationId = 1;
  private nextMessageId = 1;

  async getConversation(id: number, userId: string): Promise<Conversation | undefined> {
    const conversation = this.conversations.get(id);
    if (!conversation || conversation.userId !== userId) return undefined;
    return conversation;
  }

  async getAllConversations(userId: string): Promise<Conversation[]> {
    return Array.from(this.conversations.values())
      .filter((c) => c.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createConversation(userId: string, title: string): Promise<Conversation> {
    const conversation: Conversation = {
      id: this.nextConversationId++,
      userId,
      title,
      messages: [],
      createdAt: new Date(),
    };
    this.conversations.set(conversation.id, conversation);
    return conversation;
  }

  async deleteConversation(id: number, userId: string): Promise<void> {
    const conversation = this.conversations.get(id);
    if (conversation && conversation.userId === userId) {
      this.conversations.delete(id);
    }
  }

  async getMessagesByConversation(conversationId: number, userId: string): Promise<ChatMessage[]> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation || conversation.userId !== userId) return [];
    return conversation.messages;
  }

  async createMessage(
    conversationId: number,
    userId: string,
    role: "user" | "assistant",
    content: string
  ): Promise<ChatMessage> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation || conversation.userId !== userId) {
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
