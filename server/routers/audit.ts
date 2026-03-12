import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { invokeLLM } from "../_core/llm";

export const auditRouter = router({
  generateProspectAudit: publicProcedure
    .input(
      z.object({
        companyName: z.string().min(1).max(256),
        websiteUrl: z.string().url(),
        city: z.string().max(128).optional(),
        state: z.string().max(64).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { companyName, websiteUrl, city, state } = input;
      const location = [city, state].filter(Boolean).join(", ");

      const systemPrompt = `You are a senior digital marketing consultant specializing in roofing contractors and home service businesses. 
You analyze businesses and produce detailed, honest audit reports that identify specific problems and opportunities.
Your reports are direct, specific, and actionable — not generic. You always reference the actual company by name.
You output ONLY valid JSON matching the schema provided.`;

      const userPrompt = `Analyze this roofing contractor business and generate a comprehensive audit report:

Company Name: ${companyName}
Website: ${websiteUrl}
Location: ${location || "Not specified"}

Generate a detailed audit report covering:
1. Google AI / AEO visibility (are they showing up in AI search answers?)
2. Online presence strength (website quality, social media, reviews)
3. Ad presence (are they running paid ads? Are they effective?)
4. Xactimate supplement opportunity (are they likely leaving money on the table?)
5. Automation gaps (are they following up with leads automatically?)
6. Competitive positioning

For each area, give a score 1-10, specific findings, and exact recommendations.
Be specific to roofing contractors doing insurance restoration work.

Return this exact JSON structure:
{
  "companyName": string,
  "websiteUrl": string,
  "location": string,
  "overallScore": number (1-100),
  "overallGrade": "A" | "B" | "C" | "D" | "F",
  "executiveSummary": string (2-3 sentences, specific to this company),
  "estimatedMonthlyRevenueLost": string (e.g. "$3,200 - $8,500"),
  "sections": array of audit sections,
  "topPriorities": array of 3 strings,
  "proposedServices": array of service objects,
  "callScript": string (personalized opening line for a cold call)
}`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "prospect_audit",
            strict: true,
            schema: {
              type: "object",
              properties: {
                companyName: { type: "string" },
                websiteUrl: { type: "string" },
                location: { type: "string" },
                overallScore: { type: "number" },
                overallGrade: { type: "string" },
                executiveSummary: { type: "string" },
                estimatedMonthlyRevenueLost: { type: "string" },
                sections: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      title: { type: "string" },
                      score: { type: "number" },
                      status: { type: "string" },
                      finding: { type: "string" },
                      recommendation: { type: "string" },
                      estimatedImpact: { type: "string" },
                    },
                    required: ["id", "title", "score", "status", "finding", "recommendation", "estimatedImpact"],
                    additionalProperties: false,
                  },
                },
                topPriorities: { type: "array", items: { type: "string" } },
                proposedServices: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      service: { type: "string" },
                      price: { type: "string" },
                      description: { type: "string" },
                      urgency: { type: "string" },
                    },
                    required: ["service", "price", "description", "urgency"],
                    additionalProperties: false,
                  },
                },
                callScript: { type: "string" },
              },
              required: [
                "companyName", "websiteUrl", "location", "overallScore", "overallGrade",
                "executiveSummary", "estimatedMonthlyRevenueLost", "sections",
                "topPriorities", "proposedServices", "callScript"
              ],
              additionalProperties: false,
            },
          },
        },
      });

      const content = (response as any)?.choices?.[0]?.message?.content;
      if (!content) throw new Error("AI analysis failed — please try again");

      try {
        const audit = JSON.parse(content);
        return { success: true, audit };
      } catch {
        throw new Error("Failed to parse AI response — please try again");
      }
    }),
});
