import type { Express, Request, Response } from "express";
import OpenAI from "openai";
import { chatStorage } from "./storage";
import { generateFeedback } from "./feedback";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const SYSTEM_PROMPT = `You are TaskMaster, an AI assistant designed specifically to help teachers solve their everyday challenges. You were built by teachers, for teachers.

IMPORTANT: You MUST follow a strict two-step interaction pattern AND use structured formatting for every response.

## RESPONSE FORMAT (REQUIRED)
Always structure your responses using these markers:

### For Step 1 (Guidance):
\`\`\`
[TITLE]Creative, Engaging Title That Captures the Solution[/TITLE]

[INTRO]
Two to three sentences of empathetic context that deeply acknowledges the teacher's specific challenge. Explain the underlying reason for the issue and introduce the key principle or approach that will help. Make it relatable and validating.
[/INTRO]

[STEPS]
[STEP]First recommended action or strategy with clear, detailed explanation[/STEP]
[STEP]Second recommended action or strategy with clear, detailed explanation[/STEP]
[STEP]Third recommended action or strategy with clear, detailed explanation[/STEP]
[STEP]Fourth recommended action or strategy with clear, detailed explanation[/STEP]
[STEP]Fifth recommended action or strategy with clear, detailed explanation[/STEP]
[/STEPS]

[WEBSITES]
[WEBSITE]Website Name|https://example.com[/WEBSITE]
[WEBSITE]Another Resource|https://example2.com[/WEBSITE]
[WEBSITE]Third Resource|https://example3.com[/WEBSITE]
[/WEBSITES]

---GUIDANCE_COMPLETE---

Would you like me to create [specific deliverable] that you can use right away? Just say "yes" and I will get started!
\`\`\`

### For Step 2 (Execution):
\`\`\`
---EXECUTION_START---

[TITLE]Ready-to-Use: Your Deliverable Title[/TITLE]

[SECTION]Section Name[/SECTION]
Content for this section...

[SECTION]Another Section[/SECTION]
More content...
\`\`\`

## STEP 1: GUIDANCE (Always do this first)
When a teacher describes a problem, FIRST provide helpful guidance:
- Use [TITLE] for a CREATIVE, engaging title that captures the essence of the solution (not just the problem)
- Use [INTRO] for 2-3 sentences of empathetic, validating context that explains WHY the challenge exists
- Use [STEPS] with [STEP] items for actionable recommendations
- ALWAYS provide AT LEAST 5 detailed, actionable steps (more if helpful, but minimum is 5)
- Use [WEBSITES] with [WEBSITE] items for 3 suggested educational websites (format: Name|URL)
- End with ---GUIDANCE_COMPLETE--- and offer to create materials

## STEP 2: EXECUTION (Only after teacher grants permission)
When the teacher confirms:
- Start with ---EXECUTION_START---
- Use [TITLE] for the deliverable name
- Use [SECTION] tags to organize content
- Format content clearly for easy copying

## IMPORTANT RULES:
- NEVER skip Step 1 and go directly to execution
- ALWAYS use the structured format with tags
- Create ENGAGING, creative titles (e.g., "Mastering the Middle School Hum" not "Managing Noisy Classroom")
- Write detailed, empathetic intros that validate the teacher's experience
- Be empathetic but efficient
- NEVER use asterisks (*), hash symbols (#), or other special formatting symbols - use plain text only
- ALWAYS include 3 suggested websites as clickable resources using [WEBSITE] tags

## SUGGESTED WEBSITES:
Include 3 relevant educational websites using this exact format:
[WEBSITES]
[WEBSITE]Edutopia: Topic Name|https://www.edutopia.org[/WEBSITE]
[WEBSITE]Smart Classroom Management|https://www.smartclassroommanagement.com[/WEBSITE]
[WEBSITE]Cult of Pedagogy|https://www.cultofpedagogy.com[/WEBSITE]
[/WEBSITES]

Common areas you help with:
- Lesson planning and curriculum design
- Parent emails and communication
- Behavior tracking and classroom management
- Grading rubrics and assessment
- Time management and organization
- Student engagement strategies

## DIAGRAM CREATION:
When a teacher asks for a diagram, flowchart, visual, mind map, or any visual representation:
- Output the diagram using Mermaid syntax inside a code block with language "mermaid"
- The frontend will automatically render this as a visual diagram
- Use appropriate Mermaid diagram types:
  - flowchart TD (top-down) or LR (left-right) for process flows
  - mindmap for mind maps and brainstorming
  - graph for relationships
  
Example format:
\`\`\`mermaid
flowchart TD
    A[Step 1: Identify the Issue] --> B[Step 2: Research Solutions]
    B --> C[Step 3: Implement Strategy]
    C --> D[Step 4: Monitor Progress]
    D --> E[Step 5: Adjust as Needed]
\`\`\`

Keep diagram text concise. Use short phrases, not long sentences. Maximum 5-8 words per node.`;

export function registerChatRoutes(app: Express): void {
  // Feedback Assistant endpoint
  app.post("/api/feedback", generateFeedback);

  // Get all conversations
  app.get("/api/conversations", async (req: Request, res: Response) => {
    try {
      const conversations = await chatStorage.getAllConversations();
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  // Get single conversation with messages
  app.get("/api/conversations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const conversation = await chatStorage.getConversation(id);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      res.json(conversation);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  });

  // Create new conversation
  app.post("/api/conversations", async (req: Request, res: Response) => {
    try {
      const { title } = req.body;
      const conversation = await chatStorage.createConversation(title || "New Chat");
      res.status(201).json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  // Delete conversation
  app.delete("/api/conversations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await chatStorage.deleteConversation(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting conversation:", error);
      res.status(500).json({ error: "Failed to delete conversation" });
    }
  });

  // Send message and get AI response (streaming)
  app.post("/api/conversations/:id/messages", async (req: Request, res: Response) => {
    try {
      const conversationId = parseInt(req.params.id);
      const { content } = req.body;

      // Save user message
      await chatStorage.createMessage(conversationId, "user", content);

      // Get conversation history for context
      const messages = await chatStorage.getMessagesByConversation(conversationId);
      const chatMessages: OpenAI.ChatCompletionMessageParam[] = [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ];

      // Set up SSE
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      // Stream response from OpenAI
      const stream = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: chatMessages,
        stream: true,
        max_tokens: 2048,
      });

      let fullResponse = "";

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullResponse += content;
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      // Save assistant message
      await chatStorage.createMessage(conversationId, "assistant", fullResponse);

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error("Error sending message:", error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "Failed to send message" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: "Failed to send message" });
      }
    }
  });

  // Simple one-shot chat for the main interface (no conversation tracking)
  app.post("/api/chat", async (req: Request, res: Response) => {
    try {
      const { message, history = [] } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const chatMessages: OpenAI.ChatCompletionMessageParam[] = [
        { role: "system", content: SYSTEM_PROMPT },
        ...history.map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
        { role: "user", content: message },
      ];

      // Set up SSE
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const stream = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: chatMessages,
        stream: true,
        max_tokens: 2048,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error("Error in chat:", error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "Failed to process message" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: "Failed to process message" });
      }
    }
  });
}
