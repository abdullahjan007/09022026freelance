import {
  type User,
  type InsertUser,
  type Lesson,
  type InsertLesson,
  type Task,
  type InsertTask,
  type Class,
  type InsertClass,
  type Template,
  type InsertTemplate,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Lessons
  getLessons(): Promise<Lesson[]>;
  getLesson(id: string): Promise<Lesson | undefined>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  updateLesson(id: string, lesson: Partial<InsertLesson>): Promise<Lesson | undefined>;
  deleteLesson(id: string): Promise<boolean>;

  // Tasks
  getTasks(): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;

  // Classes
  getClasses(): Promise<Class[]>;
  getClass(id: string): Promise<Class | undefined>;
  createClass(classData: InsertClass): Promise<Class>;
  updateClass(id: string, classData: Partial<InsertClass>): Promise<Class | undefined>;
  deleteClass(id: string): Promise<boolean>;

  // Templates
  getTemplates(): Promise<Template[]>;
  getTemplate(id: string): Promise<Template | undefined>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  updateTemplate(id: string, template: Partial<InsertTemplate>): Promise<Template | undefined>;
  deleteTemplate(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private lessons: Map<string, Lesson>;
  private tasks: Map<string, Task>;
  private classes: Map<string, Class>;
  private templates: Map<string, Template>;

  constructor() {
    this.users = new Map();
    this.lessons = new Map();
    this.tasks = new Map();
    this.classes = new Map();
    this.templates = new Map();

    // Add some sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample lessons
    const sampleLessons: Lesson[] = [
      {
        id: randomUUID(),
        title: "Introduction to Fractions",
        subject: "Mathematics",
        grade: "4",
        duration: 45,
        objectives: "Students will understand the concept of fractions and be able to identify numerator and denominator.",
        content: "Begin with pizza slices visual. Introduce vocabulary: numerator, denominator. Practice with hands-on fraction circles. Group activity: create fraction art.",
        materials: "Fraction circles, worksheets, colored paper",
        status: "ready",
      },
      {
        id: randomUUID(),
        title: "The Water Cycle",
        subject: "Science",
        grade: "5",
        duration: 60,
        objectives: "Students will describe the stages of the water cycle and explain evaporation, condensation, and precipitation.",
        content: "Watch water cycle video. Create water cycle diagram in groups. Conduct evaporation experiment with cups of water. Discuss real-world examples.",
        materials: "Video projector, poster paper, markers, plastic cups, water",
        status: "draft",
      },
      {
        id: randomUUID(),
        title: "Creative Writing: Story Beginnings",
        subject: "English",
        grade: "6",
        duration: 50,
        objectives: "Students will craft engaging story openings using various techniques such as dialogue, action, and setting.",
        content: "Analyze famous first lines from literature. Discuss techniques: hook, setting mood, introducing conflict. Students write three different openings for the same story concept.",
        materials: "Sample texts, writing journals",
        status: "completed",
      },
    ];

    sampleLessons.forEach((lesson) => this.lessons.set(lesson.id, lesson));

    // Sample tasks
    const sampleTasks: Task[] = [
      {
        id: randomUUID(),
        title: "Grade math homework",
        description: "Grade and provide feedback on Chapter 5 homework assignments",
        priority: "high",
        status: "todo",
        dueDate: "2025-01-03",
        subject: "Mathematics",
      },
      {
        id: randomUUID(),
        title: "Prepare science lab materials",
        description: "Set up equipment for tomorrow's chemistry experiment",
        priority: "medium",
        status: "in_progress",
        dueDate: "2025-01-02",
        subject: "Science",
      },
      {
        id: randomUUID(),
        title: "Update parent communication",
        description: "Send weekly newsletter to parents about upcoming events",
        priority: "medium",
        status: "todo",
        dueDate: "2025-01-05",
        subject: "General",
      },
      {
        id: randomUUID(),
        title: "Submit attendance reports",
        description: "Complete monthly attendance documentation",
        priority: "low",
        status: "done",
        dueDate: "2024-12-28",
        subject: "General",
      },
    ];

    sampleTasks.forEach((task) => this.tasks.set(task.id, task));

    // Sample classes
    const sampleClasses: Class[] = [
      {
        id: randomUUID(),
        name: "Period 1 - Algebra",
        subject: "Mathematics",
        grade: "8",
        studentCount: 28,
        room: "Room 201",
        schedule: "Mon/Wed/Fri 8:00 AM - 9:00 AM",
      },
      {
        id: randomUUID(),
        name: "Period 3 - Biology",
        subject: "Science",
        grade: "9",
        studentCount: 24,
        room: "Lab 102",
        schedule: "Tue/Thu 10:30 AM - 12:00 PM",
      },
      {
        id: randomUUID(),
        name: "Period 5 - English Literature",
        subject: "English",
        grade: "10",
        studentCount: 26,
        room: "Room 305",
        schedule: "Mon/Tue/Wed/Thu 1:00 PM - 2:00 PM",
      },
    ];

    sampleClasses.forEach((c) => this.classes.set(c.id, c));

    // Sample templates
    const sampleTemplates: Template[] = [
      {
        id: randomUUID(),
        name: "Parent-Teacher Conference Request",
        category: "parent",
        subject: "Request for Parent-Teacher Meeting",
        content: `Dear [Parent Name],

I hope this message finds you well. I am writing to request a meeting to discuss [Student Name]'s progress in [Subject].

I would like to schedule a time that works for both of us. Please let me know your availability for the following dates:
- [Date Option 1]
- [Date Option 2]
- [Date Option 3]

Thank you for your continued support in your child's education.

Best regards,
[Your Name]`,
      },
      {
        id: randomUUID(),
        name: "Late Assignment Reminder",
        category: "student",
        subject: "Reminder: Outstanding Assignment",
        content: `Hi [Student Name],

This is a friendly reminder that your [Assignment Name] assignment is past due. The original due date was [Due Date].

Please submit your work by [New Deadline] to avoid further grade penalties. If you are having difficulty with the assignment, please come see me during office hours.

Let me know if you have any questions.

[Your Name]`,
      },
      {
        id: randomUUID(),
        name: "Field Trip Permission",
        category: "admin",
        subject: "Field Trip Permission Form Request",
        content: `Dear Administration,

I am writing to request approval for a field trip for my [Grade Level] [Subject] class.

Trip Details:
- Destination: [Location]
- Date: [Date]
- Time: [Departure Time] - [Return Time]
- Number of Students: [Number]
- Educational Purpose: [Purpose]

I have attached the preliminary itinerary and risk assessment for your review.

Please let me know if you need any additional information.

Thank you,
[Your Name]`,
      },
    ];

    sampleTemplates.forEach((t) => this.templates.set(t.id, t));
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Lesson methods
  async getLessons(): Promise<Lesson[]> {
    return Array.from(this.lessons.values());
  }

  async getLesson(id: string): Promise<Lesson | undefined> {
    return this.lessons.get(id);
  }

  async createLesson(insertLesson: InsertLesson): Promise<Lesson> {
    const id = randomUUID();
    const lesson: Lesson = {
      ...insertLesson,
      id,
      status: insertLesson.status || "draft",
      materials: insertLesson.materials || null,
    };
    this.lessons.set(id, lesson);
    return lesson;
  }

  async updateLesson(
    id: string,
    updates: Partial<InsertLesson>
  ): Promise<Lesson | undefined> {
    const lesson = this.lessons.get(id);
    if (!lesson) return undefined;
    const updated = { ...lesson, ...updates };
    this.lessons.set(id, updated);
    return updated;
  }

  async deleteLesson(id: string): Promise<boolean> {
    return this.lessons.delete(id);
  }

  // Task methods
  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getTask(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = randomUUID();
    const task: Task = {
      ...insertTask,
      id,
      status: insertTask.status || "todo",
      priority: insertTask.priority || "medium",
      description: insertTask.description || null,
      dueDate: insertTask.dueDate || null,
      subject: insertTask.subject || null,
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(
    id: string,
    updates: Partial<InsertTask>
  ): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    const updated = { ...task, ...updates };
    this.tasks.set(id, updated);
    return updated;
  }

  async deleteTask(id: string): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // Class methods
  async getClasses(): Promise<Class[]> {
    return Array.from(this.classes.values());
  }

  async getClass(id: string): Promise<Class | undefined> {
    return this.classes.get(id);
  }

  async createClass(insertClass: InsertClass): Promise<Class> {
    const id = randomUUID();
    const classData: Class = {
      ...insertClass,
      id,
      studentCount: insertClass.studentCount || 0,
      room: insertClass.room || null,
      schedule: insertClass.schedule || null,
    };
    this.classes.set(id, classData);
    return classData;
  }

  async updateClass(
    id: string,
    updates: Partial<InsertClass>
  ): Promise<Class | undefined> {
    const classData = this.classes.get(id);
    if (!classData) return undefined;
    const updated = { ...classData, ...updates };
    this.classes.set(id, updated);
    return updated;
  }

  async deleteClass(id: string): Promise<boolean> {
    return this.classes.delete(id);
  }

  // Template methods
  async getTemplates(): Promise<Template[]> {
    return Array.from(this.templates.values());
  }

  async getTemplate(id: string): Promise<Template | undefined> {
    return this.templates.get(id);
  }

  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const id = randomUUID();
    const template: Template = { ...insertTemplate, id };
    this.templates.set(id, template);
    return template;
  }

  async updateTemplate(
    id: string,
    updates: Partial<InsertTemplate>
  ): Promise<Template | undefined> {
    const template = this.templates.get(id);
    if (!template) return undefined;
    const updated = { ...template, ...updates };
    this.templates.set(id, updated);
    return updated;
  }

  async deleteTemplate(id: string): Promise<boolean> {
    return this.templates.delete(id);
  }
}

export const storage = new MemStorage();
