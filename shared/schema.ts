import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";

// Lessons table for lesson planning
export const lessons = pgTable("lessons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  subject: text("subject").notNull(),
  grade: text("grade").notNull(),
  duration: integer("duration").notNull(), // in minutes
  objectives: text("objectives").notNull(),
  content: text("content").notNull(),
  materials: text("materials"),
  status: text("status").notNull().default("draft"), // draft, ready, completed
});

export const insertLessonSchema = createInsertSchema(lessons).omit({ id: true });
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type Lesson = typeof lessons.$inferSelect;

// Tasks table for task management
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority").notNull().default("medium"), // low, medium, high
  status: text("status").notNull().default("todo"), // todo, in_progress, done
  dueDate: text("due_date"),
  subject: text("subject"),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true });
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

// Classes table for classroom management
export const classes = pgTable("classes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  grade: text("grade").notNull(),
  studentCount: integer("student_count").notNull().default(0),
  room: text("room"),
  schedule: text("schedule"),
});

export const insertClassSchema = createInsertSchema(classes).omit({ id: true });
export type InsertClass = z.infer<typeof insertClassSchema>;
export type Class = typeof classes.$inferSelect;

// Communication templates
export const templates = pgTable("templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(), // parent, student, admin, colleague
  subject: text("subject").notNull(),
  content: text("content").notNull(),
});

export const insertTemplateSchema = createInsertSchema(templates).omit({ id: true });
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Template = typeof templates.$inferSelect;

// Students Grader - 3-step feedback generation
export const feedbackGenerateSchema = z.object({
  rubric: z.string(),
  exampleWork: z.string(),
  sampleFeedback: z.string(),
  newStudentWork: z.string(),
});

export type FeedbackGenerateRequest = z.infer<typeof feedbackGenerateSchema>;

export const feedbackGenerateResponseSchema = z.object({
  feedback: z.string(),
});

export type FeedbackGenerateResponse = z.infer<typeof feedbackGenerateResponseSchema>;

// Calendar events for Personal Planner
export const calendarEvents = pgTable("calendar_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  date: text("date").notNull(), // ISO date string YYYY-MM-DD
  startTime: text("start_time"), // HH:MM format
  endTime: text("end_time"), // HH:MM format
  eventType: text("event_type").notNull().default("event"), // event, meeting, reminder, deadline
  color: text("color").default("#7C3AED"), // hex color for visual distinction
});

export const insertCalendarEventSchema = createInsertSchema(calendarEvents).omit({ id: true });
export type InsertCalendarEvent = z.infer<typeof insertCalendarEventSchema>;
export type CalendarEvent = typeof calendarEvents.$inferSelect;
