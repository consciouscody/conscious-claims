import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import { getDb } from "../db";
import { linkedinPosts, waitlistSignups } from "../../drizzle/schema";
import { eq, desc, count } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";
import { TRPCError } from "@trpc/server";

const tonePrompts: Record<string, string> = {
  mcconaughey: `Write like Matthew McConaughey. Short, philosophical, cinematic. No hashtags. No emojis. No bullet points. Just raw, punchy prose. 3–5 lines max. Start with a bold statement or observation. End with something that makes them think. The vibe is: confident, unhurried, a little mysterious.`,
  direct: `Write like a no-BS contractor who's seen it all. Short sentences. Blunt truths. No fluff. Talk to roofing contractors like a peer, not a salesman.`,
  story: `Tell a short story. One job. One moment. One lesson. 4–6 lines. Make it feel real. End with the takeaway.`,
  provocative: `Start with a controversial statement that roofing contractors will either strongly agree or disagree with. Make them stop scrolling. 3–4 lines. No softening.`,
};

export const linkedinRouter = router({
  // Generate 3 McConaughey-style LinkedIn posts from a topic
  generatePosts: protectedProcedure
    .input(
      z.object({
        topic: z.string().min(3).max(512),
        tone: z.enum(["mcconaughey", "direct", "story", "provocative"]).default("mcconaughey"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const systemPrompt = `You are a LinkedIn content writer for Cody, owner of SupplementAI and Conscious Consulting. He helps roofing contractors recover missed Xactimate line items and get paid what they deserve from insurance adjusters. His brand is confident, street-smart, and results-driven.

${tonePrompts[input.tone]}

Generate exactly 3 different LinkedIn posts about the topic provided. Each post should be distinct in angle and opening line. Return ONLY a JSON object with a "posts" array of 3 strings.`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Topic: ${input.topic}\n\nGenerate 3 LinkedIn posts. Return as JSON object with posts array of 3 strings.`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "linkedin_posts",
            strict: true,
            schema: {
              type: "object",
              properties: {
                posts: {
                  type: "array",
                  items: { type: "string" },
                },
              },
              required: ["posts"],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0].message.content;
      const parsed = JSON.parse(typeof content === "string" ? content : JSON.stringify(content));
      const posts: string[] = parsed.posts.slice(0, 3);

      // Save to DB
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [saved] = await db
        .insert(linkedinPosts)
        .values({
          userId: ctx.user.id,
          topic: input.topic,
          tone: input.tone,
          generatedPosts: JSON.stringify(posts),
        })
        .$returningId();

      return { id: saved.id, posts };
    }),

  // Save the chosen post
  savePost: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        savedPost: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      await db
        .update(linkedinPosts)
        .set({ savedPost: input.savedPost, used: 1 })
        .where(eq(linkedinPosts.id, input.id));
      return { success: true };
    }),

  // Get post history
  getMyPosts: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const posts = await db
      .select()
      .from(linkedinPosts)
      .where(eq(linkedinPosts.userId, ctx.user.id))
      .orderBy(desc(linkedinPosts.createdAt))
      .limit(20);
    return posts.map((p) => ({
      ...p,
      generatedPosts: JSON.parse(p.generatedPosts) as string[],
    }));
  }),
});

// Waitlist router
export const waitlistRouter = router({
  // Public signup
  signup: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        name: z.string().optional(),
        company: z.string().optional(),
        source: z.string().default("waitlist_page"),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Check for duplicate
      const existing = await db
        .select({ id: waitlistSignups.id })
        .from(waitlistSignups)
        .where(eq(waitlistSignups.email, input.email))
        .limit(1);

      if (existing.length > 0) {
        return { success: true, alreadySignedUp: true };
      }

      await db.insert(waitlistSignups).values({
        email: input.email,
        name: input.name ?? null,
        company: input.company ?? null,
        source: input.source,
      });

      // Notify owner
      await notifyOwner({
        title: "New Waitlist Signup!",
        content: `${input.name || input.email} (${input.company || "no company"}) just joined the waitlist from ${input.source}.`,
      });

      return { success: true, alreadySignedUp: false };
    }),

  // Public count
  getCount: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { count: 0 };
    const [result] = await db.select({ count: count() }).from(waitlistSignups);
    return { count: result.count };
  }),

  // Admin: get all signups
  getAll: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") return [];
    const db = await getDb();
    if (!db) return [];
    return db
      .select()
      .from(waitlistSignups)
      .orderBy(desc(waitlistSignups.createdAt));
  }),
});
