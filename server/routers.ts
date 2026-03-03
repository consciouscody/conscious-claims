import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  createJob,
  getJobsByUser,
  getJobById,
  updateJob,
  updateJobStatus,
  deleteJob,
  createJobPhoto,
  getPhotosByJob,
  updatePhotoAnalysis,
  deletePhoto,
  createSupplementLineItems,
  getSupplementLineItemsByJob,
  updateSupplementLineItem,
  deleteSupplementLineItemsByJob,
  createAdjusterEmail,
  getAdjusterEmailsByJob,
  updateAdjusterEmail,
  getStatusHistoryByJob,
  getDashboardStats,
} from "./db";
import { detectMissingItems, SUPPLEMENT_KNOWLEDGE_BASE } from "./supplementKnowledgeBase";
import { invokeLLM } from "./_core/llm";
import { stripeRouter } from "./stripeRouter";
import { notifyOwner } from "./_core/notification";

export const appRouter = router({
  stripe: stripeRouter,
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Jobs ───────────────────────────────────────────────────────────────────
  jobs: router({
    list: protectedProcedure.query(({ ctx }) => getJobsByUser(ctx.user.id)),

    stats: protectedProcedure.query(({ ctx }) => getDashboardStats(ctx.user.id)),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ ctx, input }) => getJobById(input.id, ctx.user.id)),

    create: protectedProcedure
      .input(
        z.object({
          propertyAddress: z.string().min(1),
          homeownerName: z.string().optional(),
          claimNumber: z.string().optional(),
          insuranceCarrier: z.string().optional(),
          adjusterName: z.string().optional(),
          adjusterEmail: z.string().optional(),
          adjusterPhone: z.string().optional(),
          dateOfLoss: z.string().optional(),
          notes: z.string().optional(),
          feePercentage: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const job = await createJob({
          userId: ctx.user.id,
          propertyAddress: input.propertyAddress,
          homeownerName: input.homeownerName,
          claimNumber: input.claimNumber,
          insuranceCarrier: input.insuranceCarrier,
          adjusterName: input.adjusterName,
          adjusterEmail: input.adjusterEmail,
          adjusterPhone: input.adjusterPhone,
          dateOfLoss: input.dateOfLoss ? new Date(input.dateOfLoss) : undefined,
          notes: input.notes,
          feePercentage: input.feePercentage || "12.00",
          status: "draft",
        });
        // Notify owner of new job
        notifyOwner({
          title: `New Job Created`,
          content: `${ctx.user.name || ctx.user.email} created a new job: ${input.propertyAddress}${input.claimNumber ? ` (Claim: ${input.claimNumber})` : ""}${input.insuranceCarrier ? ` — ${input.insuranceCarrier}` : ""}`,
        }).catch(() => {}); // fire-and-forget
        return { success: true };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          propertyAddress: z.string().optional(),
          homeownerName: z.string().optional(),
          claimNumber: z.string().optional(),
          insuranceCarrier: z.string().optional(),
          adjusterName: z.string().optional(),
          adjusterEmail: z.string().optional(),
          adjusterPhone: z.string().optional(),
          notes: z.string().optional(),
          feePercentage: z.string().optional(),
          originalEstimateAmount: z.string().optional(),
          supplementAmount: z.string().optional(),
          recoveredAmount: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        // Calculate fee amount if recovered amount is provided
        const updateData: Record<string, unknown> = { ...data };
        if (data.recoveredAmount && data.feePercentage) {
          const fee = (parseFloat(data.recoveredAmount) * parseFloat(data.feePercentage)) / 100;
          updateData.feeAmount = fee.toFixed(2);
        }
        await updateJob(id, ctx.user.id, updateData as any);
        return { success: true };
      }),

    updateStatus: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum([
            "draft",
            "estimate_uploaded",
            "supplement_generated",
            "email_drafted",
            "submitted",
            "approved",
            "denied",
            "paid",
          ]),
          note: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await updateJobStatus(input.id, ctx.user.id, input.status, input.note);
        // Notify owner on key status milestones
        if (["approved", "denied", "paid", "submitted"].includes(input.status)) {
          const statusLabels: Record<string, string> = {
            submitted: "Supplement Submitted to Adjuster",
            approved: "Supplement APPROVED",
            denied: "Supplement DENIED",
            paid: "Payment Received",
          };
          notifyOwner({
            title: statusLabels[input.status] || `Job Status: ${input.status}`,
            content: `Job #${input.id} status changed to "${input.status}" by ${ctx.user.name || ctx.user.email}${input.note ? `. Note: ${input.note}` : ""}.`,
          }).catch(() => {});
        }
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteJob(input.id, ctx.user.id);
        return { success: true };
      }),

    statusHistory: protectedProcedure
      .input(z.object({ jobId: z.number() }))
      .query(({ input }) => getStatusHistoryByJob(input.jobId)),
  }),

  // ─── Photos ─────────────────────────────────────────────────────────────────
  photos: router({
    list: protectedProcedure
      .input(z.object({ jobId: z.number() }))
      .query(({ input }) => getPhotosByJob(input.jobId)),

    save: protectedProcedure
      .input(
        z.object({
          jobId: z.number(),
          url: z.string(),
          fileKey: z.string(),
          filename: z.string().optional(),
          label: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await createJobPhoto({ ...input, userId: ctx.user.id });
        return { success: true };
      }),

    analyzeWithAI: protectedProcedure
      .input(z.object({ photoId: z.number(), photoUrl: z.string(), jobId: z.number() }))
      .mutation(async ({ input }) => {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "You are an expert roofing insurance supplement specialist. Analyze the provided roof photo and identify any evidence that supports supplement line items. Look for: multiple shingle layers, damaged or missing drip edge, missing valley metal, damaged step flashing, deteriorated pipe boots, missing starter shingles, hail damage, wind damage, and any other supplement-worthy conditions. Be specific and reference Xactimate line item codes where applicable.",
            },
            {
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: { url: input.photoUrl, detail: "high" },
                },
                {
                  type: "text",
                  text: "Please analyze this roof photo and identify any evidence that supports insurance supplement line items. List specific findings with corresponding Xactimate codes.",
                },
              ],
            },
          ],
        });

        const analysis = (response as any)?.choices?.[0]?.message?.content || "Analysis not available";
        await updatePhotoAnalysis(input.photoId, analysis);
        return { analysis };
      }),

    delete: protectedProcedure
      .input(z.object({ photoId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deletePhoto(input.photoId, ctx.user.id);
        return { success: true };
      }),
  }),

  // ─── Supplement Items ────────────────────────────────────────────────────────
  supplement: router({
    knowledgeBase: publicProcedure.query(() => SUPPLEMENT_KNOWLEDGE_BASE),

    getByJob: protectedProcedure
      .input(z.object({ jobId: z.number() }))
      .query(({ input }) => getSupplementLineItemsByJob(input.jobId)),

    detectFromEstimate: protectedProcedure
      .input(
        z.object({
          jobId: z.number(),
          parsedLineItems: z.array(
            z.object({
              code: z.string().optional(),
              description: z.string().optional(),
            })
          ),
        })
      )
      .mutation(async ({ input }) => {
        const missing = detectMissingItems(input.parsedLineItems);
        const itemsToInsert = missing.map((item) => ({
          jobId: input.jobId,
          xactimateCode: item.xactimateCode,
          description: item.description,
          unit: item.unit,
          unitPrice: item.estimatedUnitPrice.toString(),
          justification: item.justification,
          codeReference: item.codeReference,
          manufacturerReference: item.manufacturerReference,
          source: "auto_detected" as const,
          isIncluded: "yes" as const,
        }));

        // Clear existing auto-detected items first
        const existing = await getSupplementLineItemsByJob(input.jobId);
        const autoDetected = existing.filter((i) => i.source === "auto_detected");
        if (autoDetected.length > 0) {
          await deleteSupplementLineItemsByJob(input.jobId);
        }

        if (itemsToInsert.length > 0) {
          await createSupplementLineItems(itemsToInsert);
        }

        return { detected: missing.length, items: missing };
      }),

    addManual: protectedProcedure
      .input(
        z.object({
          jobId: z.number(),
          xactimateCode: z.string(),
          description: z.string(),
          unit: z.string(),
          quantity: z.string().optional(),
          unitPrice: z.string().optional(),
          totalPrice: z.string().optional(),
          justification: z.string().optional(),
          codeReference: z.string().optional(),
          manufacturerReference: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await createSupplementLineItems([{ ...input, source: "manual", isIncluded: "yes" }]);
        return { success: true };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          quantity: z.string().optional(),
          unitPrice: z.string().optional(),
          totalPrice: z.string().optional(),
          justification: z.string().optional(),
          isIncluded: z.enum(["yes", "no"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateSupplementLineItem(id, data as any);
        return { success: true };
      }),

    calculateTotal: protectedProcedure
      .input(z.object({ jobId: z.number() }))
      .query(async ({ input }) => {
        const items = await getSupplementLineItemsByJob(input.jobId);
        const included = items.filter((i) => i.isIncluded === "yes");
        const total = included.reduce((sum, item) => {
          const price = parseFloat(String(item.totalPrice || "0"));
          return sum + (isNaN(price) ? 0 : price);
        }, 0);
        return { total: total.toFixed(2), itemCount: included.length };
      }),

    generatePdfReport: protectedProcedure
      .input(z.object({ jobId: z.number() }))
      .mutation(async ({ input }) => {
        const items = await getSupplementLineItemsByJob(input.jobId);
        const included = items.filter((i) => i.isIncluded === "yes");
        const total = included.reduce((sum, item) => {
          const price = parseFloat(String(item.totalPrice || "0"));
          return sum + (isNaN(price) ? 0 : price);
        }, 0);
        // Return structured data — client will generate PDF using browser print/jsPDF
        return {
          items: included,
          total: total.toFixed(2),
          itemCount: included.length,
        };
      }),
  }),

  // ─── Adjuster Emails ─────────────────────────────────────────────────────────
  emails: router({
    list: protectedProcedure
      .input(z.object({ jobId: z.number() }))
      .query(({ input }) => getAdjusterEmailsByJob(input.jobId)),

    generate: protectedProcedure
      .input(
        z.object({
          jobId: z.number(),
          claimNumber: z.string().optional(),
          propertyAddress: z.string(),
          adjusterName: z.string().optional(),
          insuranceCarrier: z.string().optional(),
          supplementItems: z.array(
            z.object({
              xactimateCode: z.string(),
              description: z.string(),
              justification: z.string().optional(),
              codeReference: z.string().optional(),
              quantity: z.string().optional(),
              unit: z.string(),
              totalPrice: z.string().optional(),
            })
          ),
          emailType: z.enum(["supplement_request", "reinspection_request", "follow_up"]).default("supplement_request"),
          additionalContext: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const itemsList = input.supplementItems
          .map(
            (item, i) =>
              `${i + 1}. ${item.xactimateCode} – ${item.description}
   Carrier scope: Not included. Required: ${item.quantity || "TBD"} ${item.unit}
   Reason: ${item.justification || "Standard supplement item"}
   ${item.codeReference ? `Code: ${item.codeReference}` : ""}
   ${item.totalPrice ? `Estimated value: $${item.totalPrice}` : ""}`
          )
          .join("\n\n");

        const emailTypeLabel =
          input.emailType === "supplement_request"
            ? "Supplement Request"
            : input.emailType === "reinspection_request"
            ? "Reinspection Request"
            : "Follow-Up";

        const prompt = `You are an expert roofing insurance supplement specialist with 10+ years of experience. Write a professional, firm, and respectful ${emailTypeLabel} email to an insurance adjuster.

Claim Details:
- Claim #: ${input.claimNumber || "TBD"}
- Property: ${input.propertyAddress}
- Adjuster: ${input.adjusterName || "Insurance Adjuster"}
- Carrier: ${input.insuranceCarrier || "Insurance Carrier"}

Supplement Items to Request:
${itemsList}

${input.additionalContext ? `Additional Context: ${input.additionalContext}` : ""}

Write the email with:
1. A clear subject line
2. Professional greeting
3. Brief one-paragraph summary stating what you are requesting and why
4. An itemized discrepancy list using the items above
5. Reference to attached documentation (photo report, contractor estimate, measurement report)
6. A polite deadline request ("Please advise by [DATE]")
7. Professional closing

Use language like "Per field conditions...", "Per manufacturer installation requirements...", "Per IRC Section...". Avoid confrontational language. The tone should be firm but collaborative.

Format the response as:
SUBJECT: [subject line]
---
[email body]`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are an expert roofing insurance supplement specialist." },
            { role: "user", content: prompt },
          ],
        });

        const content = (response as any)?.choices?.[0]?.message?.content || "";
        const subjectMatch = content.match(/SUBJECT:\s*(.+)/);
        const subject = subjectMatch ? subjectMatch[1].trim() : `Claim #${input.claimNumber || "TBD"} – Supplement Request – ${input.propertyAddress}`;
        const body = content.replace(/SUBJECT:.+\n---\n?/, "").trim();

        // Save to database
        await createAdjusterEmail({
          jobId: input.jobId,
          subject,
          body,
          emailType: input.emailType,
        });

        return { subject, body };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          subject: z.string().optional(),
          body: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateAdjusterEmail(id, data);
        return { success: true };
      }),

    markSent: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await updateAdjusterEmail(input.id, { sentAt: new Date() });
        return { success: true };
      }),
  }),

  // ─── PDF Parsing ─────────────────────────────────────────────────────────────
  pdf: router({
    parseFromUrl: protectedProcedure
      .input(z.object({ pdfUrl: z.string(), jobId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        // Fetch the PDF from the URL
        const response = await fetch(input.pdfUrl);
        if (!response.ok) throw new Error("Failed to fetch PDF");
        const buffer = Buffer.from(await response.arrayBuffer());

        // Parse it
        const { parseXactimatePDF } = await import("./pdfParser");
        const parsed = await parseXactimatePDF(buffer);

        // Save parsed data to job
        await updateJob(input.jobId, ctx.user.id, {
          parsedLineItems: parsed.lineItems as any,
          originalEstimateAmount: parsed.totalAmount,
          claimNumber: parsed.claimNumber,
          homeownerName: parsed.insuredName,
          adjusterName: parsed.adjusterName,
          status: "estimate_uploaded",
        });

        // Auto-detect missing items
        const missing = detectMissingItems(parsed.lineItems);
        if (missing.length > 0) {
          await deleteSupplementLineItemsByJob(input.jobId);
          await createSupplementLineItems(
            missing.map((item) => ({
              jobId: input.jobId,
              xactimateCode: item.xactimateCode,
              description: item.description,
              unit: item.unit,
              unitPrice: item.estimatedUnitPrice.toString(),
              justification: item.justification,
              codeReference: item.codeReference,
              manufacturerReference: item.manufacturerReference,
              source: "auto_detected" as const,
              isIncluded: "yes" as const,
            }))
          );
        }

        return {
          lineItems: parsed.lineItems,
          claimNumber: parsed.claimNumber,
          insuredName: parsed.insuredName,
          adjusterName: parsed.adjusterName,
          totalAmount: parsed.totalAmount,
          missingItemsDetected: missing.length,
        };
      }),
  }),

  // ─── Payment Calculator ──────────────────────────────────────────────────────
  calculator: router({
    calculate: publicProcedure
      .input(
        z.object({
          supplementAmount: z.number(),
          feePercentage: z.number().min(1).max(30),
        })
      )
      .query(({ input }) => {
        const fee = (input.supplementAmount * input.feePercentage) / 100;
        const contractorNet = input.supplementAmount - fee;
        return {
          supplementAmount: input.supplementAmount,
          feePercentage: input.feePercentage,
          feeAmount: parseFloat(fee.toFixed(2)),
          contractorNet: parseFloat(contractorNet.toFixed(2)),
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
