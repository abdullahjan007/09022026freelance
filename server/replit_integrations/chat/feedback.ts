import type { Request, Response } from "express";
import OpenAI from "openai";
import { feedbackRequestSchema, type FeedbackResponse } from "@shared/schema";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const FEEDBACK_SYSTEM_PROMPT = `You are a supportive feedback assistant helping teachers draft constructive student feedback. 

CRITICAL RULES:
1. NEVER assign grades or scores
2. Use neutral, professional, encouraging language
3. Focus on specific observations from the student work
4. Be constructive and growth-oriented
5. Keep feedback actionable and clear

Your task is to generate a feedback draft based on the student work provided. The teacher will review and edit this before sharing with the student.

OUTPUT FORMAT (return valid JSON only):
{
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "growthOpportunities": ["opportunity 1", "opportunity 2"],
  "nextSteps": "A short paragraph with specific, actionable next steps for the student."
}

GUIDELINES:
- Strengths: Identify 2-3 specific things the student did well, with concrete examples from their work
- Growth Opportunities: Identify 1-2 areas for improvement, framed positively
- Next Steps: Write a short paragraph (2-3 sentences) with clear, actionable guidance

Remember: The teacher owns the final feedback. You are providing a draft to save time.`;

export async function generateFeedback(req: Request, res: Response) {
  try {
    const parseResult = feedbackRequestSchema.safeParse(req.body);
    
    if (!parseResult.success) {
      return res.status(400).json({ 
        error: "Invalid request", 
        details: parseResult.error.issues 
      });
    }

    const { studentWork, learningFocus, rubric, mustInclude, mustAvoid } = parseResult.data;

    if (!studentWork?.trim()) {
      return res.status(400).json({ error: "Student work is required" });
    }

    let userPrompt = `Please generate feedback for the following student work:\n\n${studentWork}`;

    if (learningFocus) {
      userPrompt += `\n\nLearning Focus: ${learningFocus}`;
    }

    if (rubric) {
      userPrompt += `\n\nRubric/Criteria: ${rubric}`;
    }

    if (mustInclude) {
      userPrompt += `\n\nMust Include in Feedback: ${mustInclude}`;
    }

    if (mustAvoid) {
      userPrompt += `\n\nMust Avoid in Feedback: ${mustAvoid}`;
    }

    userPrompt += "\n\nPlease provide the feedback as JSON only, no other text.";

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: FEEDBACK_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1024,
    });

    const responseText = completion.choices[0]?.message?.content || "";
    
    let feedback: FeedbackResponse;
    try {
      const parsed = JSON.parse(responseText);
      feedback = {
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        growthOpportunities: Array.isArray(parsed.growthOpportunities) ? parsed.growthOpportunities : [],
        nextSteps: typeof parsed.nextSteps === "string" ? parsed.nextSteps : "",
      };
    } catch {
      feedback = {
        strengths: [
          "The student demonstrated effort in completing the assignment.",
          "There are elements that show understanding of the core concepts."
        ],
        growthOpportunities: [
          "Consider reviewing the specific requirements to ensure all elements are addressed."
        ],
        nextSteps: "Review the assignment guidelines and identify any areas that need additional attention. Consider asking for clarification on concepts that seem unclear.",
      };
    }

    if (feedback.strengths.length === 0) {
      feedback.strengths = ["The student made an effort to complete this work."];
    }
    if (feedback.growthOpportunities.length === 0) {
      feedback.growthOpportunities = ["Continue developing skills in this area."];
    }
    if (!feedback.nextSteps) {
      feedback.nextSteps = "Continue practicing and building on current progress.";
    }

    res.json(feedback);
  } catch (error) {
    console.error("Error generating feedback:", error);
    res.status(500).json({ error: "Failed to generate feedback" });
  }
}
