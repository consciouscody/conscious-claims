import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { visibilityAudits } from "../../drizzle/schema";
import { invokeLLM } from "../_core/llm";
import { desc, eq } from "drizzle-orm";

export const visibilityRouter = router({
  // Public — anyone can run an audit (lead gen tool)
  runAudit: publicProcedure
    .input(
      z.object({
        businessName: z.string().min(2).max(256),
        city: z.string().min(2).max(128),
        website: z.string().optional(),
        email: z.string().email().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const prompt = `You are an AI search visibility expert. Analyze this contractor business and produce a detailed AI visibility audit.

Business: ${input.businessName}
City: ${input.city}
Website: ${input.website || "Not provided"}

Generate a comprehensive AI visibility audit with the following JSON structure. Be specific, actionable, and realistic. Score each category 0-100.

The audit should reflect the reality that most local contractors are NOT optimized for AI search tools like ChatGPT, Perplexity, or Google AI Mode. Be honest about gaps.`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are an expert in AEO (Answer Engine Optimization), local SEO, and AI search visibility for contractors. Always respond with valid JSON only." },
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "visibility_audit",
            strict: true,
            schema: {
              type: "object",
              properties: {
                overallScore: { type: "integer", description: "Overall AI visibility score 0-100" },
                summary: { type: "string", description: "2-3 sentence executive summary of their visibility situation" },
                estimatedMissedLeadsPerMonth: { type: "integer", description: "Estimated number of leads they are missing per month due to poor AI visibility" },
                estimatedRevenueLostPerYear: { type: "integer", description: "Estimated revenue lost per year in dollars" },
                categories: {
                  type: "object",
                  properties: {
                    googleBusinessProfile: {
                      type: "object",
                      properties: {
                        score: { type: "integer" },
                        status: { type: "string" },
                        issues: { type: "array", items: { type: "string" } },
                        quickWin: { type: "string" }
                      },
                      required: ["score", "status", "issues", "quickWin"],
                      additionalProperties: false
                    },
                    websiteAEO: {
                      type: "object",
                      properties: {
                        score: { type: "integer" },
                        status: { type: "string" },
                        issues: { type: "array", items: { type: "string" } },
                        quickWin: { type: "string" }
                      },
                      required: ["score", "status", "issues", "quickWin"],
                      additionalProperties: false
                    },
                    aiSearchPresence: {
                      type: "object",
                      properties: {
                        score: { type: "integer" },
                        status: { type: "string" },
                        issues: { type: "array", items: { type: "string" } },
                        quickWin: { type: "string" }
                      },
                      required: ["score", "status", "issues", "quickWin"],
                      additionalProperties: false
                    },
                    reviewsAndReputation: {
                      type: "object",
                      properties: {
                        score: { type: "integer" },
                        status: { type: "string" },
                        issues: { type: "array", items: { type: "string" } },
                        quickWin: { type: "string" }
                      },
                      required: ["score", "status", "issues", "quickWin"],
                      additionalProperties: false
                    },
                    localCitations: {
                      type: "object",
                      properties: {
                        score: { type: "integer" },
                        status: { type: "string" },
                        issues: { type: "array", items: { type: "string" } },
                        quickWin: { type: "string" }
                      },
                      required: ["score", "status", "issues", "quickWin"],
                      additionalProperties: false
                    }
                  },
                  required: ["googleBusinessProfile", "websiteAEO", "aiSearchPresence", "reviewsAndReputation", "localCitations"],
                  additionalProperties: false
                },
                topThreeActions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      priority: { type: "integer" },
                      action: { type: "string" },
                      impact: { type: "string" },
                      timeToImplement: { type: "string" }
                    },
                    required: ["priority", "action", "impact", "timeToImplement"],
                    additionalProperties: false
                  }
                },
                chatGPTTestResult: { type: "string", description: "What would happen if someone asked ChatGPT to find a contractor like them in their city right now" }
              },
              required: ["overallScore", "summary", "estimatedMissedLeadsPerMonth", "estimatedRevenueLostPerYear", "categories", "topThreeActions", "chatGPTTestResult"],
              additionalProperties: false
            }
          }
        }
      });

      const content = response.choices[0].message.content as string;
      const auditResult = JSON.parse(content);
      const score = auditResult.overallScore as number;

      // Save to DB
      await db.insert(visibilityAudits).values({
        businessName: input.businessName,
        city: input.city,
        website: input.website,
        email: input.email,
        auditResult,
        score,
        leadConverted: 0,
      });

      return { auditResult, score };
    }),

  // Admin — list all audits as leads
  listAudits: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") throw new Error("Admin only");
    const db = await getDb();
    if (!db) return [];
    return db.select().from(visibilityAudits).orderBy(desc(visibilityAudits.createdAt)).limit(100);
  }),

  // Admin — mark lead as converted
  markConverted: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new Error("Admin only");
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.update(visibilityAudits).set({ leadConverted: 1 }).where(eq(visibilityAudits.id, input.id));
      return { success: true };
    }),
});
