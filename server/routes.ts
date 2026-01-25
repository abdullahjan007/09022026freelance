import type { Express } from "express";
import { type Server } from "http";
import { registerChatRoutes } from "./replit_integrations/chat";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { storage } from "./storage";
import { insertCalendarEventSchema, feedbackGenerateSchema } from "@shared/schema";
import OpenAI from "openai";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup authentication (must be before other routes)
  await setupAuth(app);
  registerAuthRoutes(app);
  
  // Register AI chat routes
  registerChatRoutes(app);

  // Calendar Events API
  app.get("/api/events", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      let events;
      if (startDate && endDate) {
        events = await storage.getCalendarEventsByDateRange(
          startDate as string,
          endDate as string
        );
      } else {
        events = await storage.getCalendarEvents();
      }
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.getCalendarEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch event" });
    }
  });

  app.post("/api/events", async (req, res) => {
    try {
      const parsed = insertCalendarEventSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      const event = await storage.createCalendarEvent(parsed.data);
      res.status(201).json(event);
    } catch (error) {
      res.status(500).json({ error: "Failed to create event" });
    }
  });

  app.patch("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.updateCalendarEvent(req.params.id, req.body);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ error: "Failed to update event" });
    }
  });

  app.delete("/api/events/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteCalendarEvent(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete event" });
    }
  });

  // Students Grader - Feedback Generation API
  app.post("/api/feedback/generate", async (req, res) => {
    try {
      const parsed = feedbackGenerateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }

      const { rubric, exampleWork, sampleFeedback, newStudentWork } = parsed.data;

      const openai = new OpenAI({
        apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
        baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
      });
      
      const systemPrompt = `You are a helpful teaching assistant that generates student feedback. 
Your task is to write feedback for new student work that matches the teacher's personal style and voice.

The teacher has provided:
1. Their grading rubric/criteria
2. An example of student work they've already graded  
3. The feedback they wrote for that example (THIS IS THEIR STYLE - match it closely)

When writing feedback for new student work:
- Match the teacher's tone, language, and level of detail exactly
- Use similar phrases and structure as their sample feedback
- Apply the same rubric criteria consistently
- Be constructive and encouraging in the same way the teacher is
- Keep approximately the same length as their sample feedback

Write ONLY the feedback text - no headers, labels, or meta-commentary.`;

      const userPrompt = `RUBRIC/GRADING CRITERIA:
${rubric}

EXAMPLE STUDENT WORK (already graded):
${exampleWork}

TEACHER'S FEEDBACK FOR EXAMPLE (match this style):
${sampleFeedback}

---

NEW STUDENT WORK TO GRADE:
${newStudentWork}

---

Write feedback for this new student work, matching the teacher's style exactly:`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const feedback = response.choices[0]?.message?.content || "Unable to generate feedback.";
      
      res.json({ feedback });
    } catch (error) {
      console.error("Feedback generation error:", error);
      res.status(500).json({ error: "Failed to generate feedback" });
    }
  });

  return httpServer;
}
