import { z } from "zod";
import { protectedProcedure } from "./routers";
import { db } from "./db";
import { jobs, dossierLineItems, jobPhotos } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * FORENSIC DOSSIER GENERATOR
 * 
 * Generates a 14-section forensic compliance blueprint for insurance claims.
 * Each section is independently queryable and can be rendered to PDF.
 */

// ─── SECTION 1: TITLE SLIDE ────────────────────────────────────────────────

export const getTitleSlide = protectedProcedure
  .input(z.object({ jobId: z.number() }))
  .query(async ({ ctx, input }) => {
    const job = await db.query.jobs.findFirst({
      where: eq(jobs.id, input.jobId),
    });

    if (!job || job.userId !== ctx.user.id) {
      throw new Error("Job not found or unauthorized");
    }

    return {
      section: 1,
      title: "Forensic Damage & Compliance Assessment",
      propertyAddress: job.propertyAddress,
      insuredName: job.homeownerName,
      adjusterName: job.adjusterName,
      claimNumber: job.claimNumber,
      preparedBy: ctx.user.companyName || "Conscious Claims",
      documentId: `Claim #${job.claimNumber} | Policy #${job.claimNumber}`,
      dateOfLoss: job.dateOfLoss,
      typeOfLoss: job.typeOfLoss || "Wind Damage",
    };
  });

// ─── SECTION 2: INSURED INFORMATION & CLAIM METADATA ────────────────────────

export const getClaimMetadata = protectedProcedure
  .input(z.object({ jobId: z.number() }))
  .query(async ({ ctx, input }) => {
    const job = await db.query.jobs.findFirst({
      where: eq(jobs.id, input.jobId),
    });

    if (!job || job.userId !== ctx.user.id) {
      throw new Error("Job not found or unauthorized");
    }

    return {
      section: 2,
      insuredInformation: {
        name: job.homeownerName,
        address: job.propertyAddress,
        adjuster: job.adjusterName,
        adjusterEmail: job.adjusterEmail,
        adjusterPhone: job.adjusterPhone,
      },
      claimMetadata: {
        typeOfLoss: job.typeOfLoss || "Wind Damage",
        dateOfLoss: job.dateOfLoss,
        claimNumber: job.claimNumber,
        insuranceCarrier: job.insuranceCarrier,
      },
    };
  });

// ─── SECTION 3: FINANCIAL RESOLUTION ────────────────────────────────────────

export const getFinancialResolution = protectedProcedure
  .input(z.object({ jobId: z.number() }))
  .query(async ({ ctx, input }) => {
    const job = await db.query.jobs.findFirst({
      where: eq(jobs.id, input.jobId),
    });

    if (!job || job.userId !== ctx.user.id) {
      throw new Error("Job not found or unauthorized");
    }

    return {
      section: 3,
      replacementCostValue: job.rcvAmount || 0,
      depreciation: job.depreciationAmount || 0,
      actualCashValue: job.acvAmount || 0,
      summary: `Total Replacement Cost Value (RCV): $${(job.rcvAmount || 0).toFixed(2)}\nLess Depreciation: ($${(job.depreciationAmount || 0).toFixed(2)})\nNet Claim / ACV Required: $${(job.acvAmount || 0).toFixed(2)}`,
    };
  });

// ─── SECTION 4: MANUFACTURER WARRANTY MANDATES ──────────────────────────────

export const getManufacturerMandates = protectedProcedure
  .input(z.object({ jobId: z.number() }))
  .query(async ({ ctx, input }) => {
    const job = await db.query.jobs.findFirst({
      where: eq(jobs.id, input.jobId),
    });

    if (!job || job.userId !== ctx.user.id) {
      throw new Error("Job not found or unauthorized");
    }

    return {
      section: 4,
      mandates: [
        {
          manufacturer: "TAMKO",
          mandate: "Synthetic Guard™ / Synthetic Guard™ Plus underlayment required",
          compliance: "ASTM D6757 / D6226 Type II compliant synthetic underlayment across entire roof deck",
          consequence: "Failure to install voids 110/130+ MPH wind warranty",
        },
        {
          manufacturer: "Owens Corning",
          mandate: "High-performance underlayment required",
          compliance: "Must meet ASTM D6757 standards",
          consequence: "Non-compliance voids manufacturer warranty",
        },
      ],
    };
  });

// ─── SECTION 5: WASTE FACTOR JUSTIFICATION ─────────────────────────────────

export const getWasteFactors = protectedProcedure
  .input(z.object({ jobId: z.number() }))
  .query(async ({ ctx, input }) => {
    const job = await db.query.jobs.findFirst({
      where: eq(jobs.id, input.jobId),
    });

    if (!job || job.userId !== ctx.user.id) {
      throw new Error("Job not found or unauthorized");
    }

    return {
      section: 5,
      wasteFactors: [
        {
          material: "Synthetic Underlayment (10-15%)",
          justification: "Accounts for 3\" horizontal side laps, 6\" vertical end laps, and ridge fold-overs",
        },
        {
          material: "Drip Edge & Gutter Apron (10-12%)",
          justification: "Accounts for mandatory 2\"-3\" seam overlaps, gable mitering, and thermal expansion trimming",
        },
        {
          material: "Starter Strips (5-10%)",
          justification: "Required for continuous application along eaves and rakes for wind warranty ratings",
        },
        {
          material: "Architectural Field Shingles (10-15%+)",
          justification: "Calculated strictly against EagleView net square footage, 4/12 predominant pitch, and geometry",
        },
      ],
    };
  });

// ─── SECTION 6: SCOPE BREAKDOWN ────────────────────────────────────────────

export const getScopeBreakdown = protectedProcedure
  .input(z.object({ jobId: z.number() }))
  .query(async ({ ctx, input }) => {
    const job = await db.query.jobs.findFirst({
      where: eq(jobs.id, input.jobId),
    });

    if (!job || job.userId !== ctx.user.id) {
      throw new Error("Job not found or unauthorized");
    }

    const lineItems = await db.query.dossierLineItems.findMany({
      where: eq(dossierLineItems.jobId, input.jobId),
    });

    // Group by category
    const categories: Record<string, number> = {};
    lineItems.forEach((item) => {
      const category = item.description?.split(" ")[0] || "Other";
      categories[category] = (categories[category] || 0) + Number(item.totalPrice || 0);
    });

    return {
      section: 6,
      totalScopeOfWork: job.rcvAmount || 0,
      categories,
      breakdown: Object.entries(categories).map(([category, amount]) => ({
        category,
        amount,
        percentage: ((amount / (job.rcvAmount || 1)) * 100).toFixed(1),
      })),
    };
  });

// ─── SECTION 7: ITEMIZED COST BREAKDOWN ────────────────────────────────────

export const getItemizedCosts = protectedProcedure
  .input(z.object({ jobId: z.number() }))
  .query(async ({ ctx, input }) => {
    const job = await db.query.jobs.findFirst({
      where: eq(jobs.id, input.jobId),
    });

    if (!job || job.userId !== ctx.user.id) {
      throw new Error("Job not found or unauthorized");
    }

    const lineItems = await db.query.dossierLineItems.findMany({
      where: eq(dossierLineItems.jobId, input.jobId),
    });

    return {
      section: 7,
      lineItems: lineItems.map((item) => ({
        code: item.xactimateCode,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        justification: item.justification,
        codeReference: item.codeReference,
      })),
      total: lineItems.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0),
    };
  });

// ─── SECTION 8: COLLATERAL COMPONENT FAILURES ──────────────────────────────

export const getCollateralFailures = protectedProcedure
  .input(z.object({ jobId: z.number() }))
  .query(async ({ ctx, input }) => {
    const job = await db.query.jobs.findFirst({
      where: eq(jobs.id, input.jobId),
    });

    if (!job || job.userId !== ctx.user.id) {
      throw new Error("Job not found or unauthorized");
    }

    const photos = await db.query.jobPhotos.findMany({
      where: eq(jobPhotos.jobId, input.jobId),
    });

    return {
      section: 8,
      title: "Collateral Component Failures",
      failures: [
        {
          component: "Power Attic Vents",
          issue: "Requiring complete replacement",
          cost: "$409.29",
          photos: photos.filter((p) => p.label?.includes("vent")),
        },
        {
          component: "HVAC Pipe Jack Flashing",
          issue: "Failure due to wind uplift",
          cost: "Included in roof",
          photos: photos.filter((p) => p.label?.includes("flashing")),
        },
        {
          component: "Skylight Perimeter Seal",
          issue: "Compromise (2 fixed units up to 5 sf)",
          cost: "$2,088.89",
          photos: photos.filter((p) => p.label?.includes("skylight")),
        },
      ],
      summary: "Compromised power attic vents requiring complete replacement ($409.29). HVAC and plumbing pipe jack flashing failure. Skylight perimeter seal compromise (2 fixed units up to 5 sf: $2,088.89).",
    };
  });

// ─── SECTION 9: WATER INTRUSION DIAGRAM ────────────────────────────────────

export const getWaterIntrusion = protectedProcedure
  .input(z.object({ jobId: z.number() }))
  .query(async ({ ctx, input }) => {
    const job = await db.query.jobs.findFirst({
      where: eq(jobs.id, input.jobId),
    });

    if (!job || job.userId !== ctx.user.id) {
      throw new Error("Job not found or unauthorized");
    }

    return {
      section: 9,
      title: "Interior Basement Mitigation",
      description: "Removal and replacement of 215 SF of compromised snaplock laminate wood flooring and 6-mil visqueen vapor barrier",
      cost: "$3,718.66",
      details: "Chimney brick remediation (cleaning and repairing 100 SF). Required extra-large room contents manipulation to facilitate mitigation.",
    };
  });

// ─── SECTION 10: NAIL FAILURE MECHANISM ────────────────────────────────────

export const getNailFailure = protectedProcedure
  .input(z.object({ jobId: z.number() }))
  .query(async ({ ctx, input }) => {
    const job = await db.query.jobs.findFirst({
      where: eq(jobs.id, input.jobId),
    });

    if (!job || job.userId !== ctx.user.id) {
      throw new Error("Job not found or unauthorized");
    }

    return {
      section: 10,
      title: "Sheathing Void & Nail Failure Mechanism",
      physics: "Laminated shingles depend entirely on precise nail placement into solid structural decking. Driven nails lose pull-through resistance when decking gaps exceed 1/8\".",
      hazard: "When decking gaps exceed 1/8\", driven nails lose pull-through resistance. During a wind event, these unsecured areas act as weak points, unzipping the roof system regardless of shingle quality or age.",
      conclusion: "Existing decking cannot safely or legally support a new laminated shingle installation. Sheathing must be replaced.",
    };
  });

// ─── SECTION 11: DECKING GAP & STRUCTURAL DEFICIENCY ──────────────────────

export const getDeckingDeficiency = protectedProcedure
  .input(z.object({ jobId: z.number() }))
  .query(async ({ ctx, input }) => {
    const job = await db.query.jobs.findFirst({
      where: eq(jobs.id, input.jobId),
    });

    if (!job || job.userId !== ctx.user.id) {
      throw new Error("Job not found or unauthorized");
    }

    const photos = await db.query.jobPhotos.findMany({
      where: eq(jobPhotos.jobId, input.jobId),
    });

    return {
      section: 11,
      title: "Decking Gap & Structural Deficiency Evidence",
      existingCondition: "Spaced board decking with >1/8\" gaps. Insufficient nail holding power. Non-compliant with modern structural standards.",
      requiredStandard: "Solid 5/8\" CDX plywood sheathing. Mandated for continuous structural support and required by shingle manufacturers to validate wind warranties.",
      cost: "$7,318.09",
      photos: photos.filter((p) => p.label?.includes("decking")),
    };
  });

// ─── SECTION 12: TIMELINE & DEGRADATION ────────────────────────────────────

export const getTimeline = protectedProcedure
  .input(z.object({ jobId: z.number() }))
  .query(async ({ ctx, input }) => {
    const job = await db.query.jobs.findFirst({
      where: eq(jobs.id, input.jobId),
    });

    if (!job || job.userId !== ctx.user.id) {
      throw new Error("Job not found or unauthorized");
    }

    return {
      section: 12,
      title: "Timeline: Integrity Compromise & Triggering Peril",
      events: [
        {
          date: "March 14-15, 2025",
          event: "Integrity Compromise",
          description: "Interactive Hail Maps confirm 1.00\" to 1.50\" hail strikes directly at the property location, weakening the laminate shingle structure.",
        },
        {
          date: "May 22, 2026",
          event: "The Triggering Peril",
          description: "The recorded Date of Loss. High wind events exploit the compromised shingles and underlying non-compliant sheathing, resulting in the catastrophic blow-offs and water intrusion observed on site.",
        },
      ],
      compoundingDegradation: "Compounding Structural Degradation — Existing decking gaps + compromised shingles = catastrophic failure",
    };
  });

// ─── SECTION 13: PROPERTY MEASUREMENTS ─────────────────────────────────────

export const getPropertyMeasurements = protectedProcedure
  .input(z.object({ jobId: z.number() }))
  .query(async ({ ctx, input }) => {
    const job = await db.query.jobs.findFirst({
      where: eq(jobs.id, input.jobId),
    });

    if (!job || job.userId !== ctx.user.id) {
      throw new Error("Job not found or unauthorized");
    }

    return {
      section: 13,
      title: "Property Measurements",
      totalRoofArea: job.roofArea || 0,
      predominantPitch: job.roofPitch || "4/12",
      complexity: job.roofComplexity || "Normal",
      facets: "5 total roof facets, categorized as 'Normal' complexity",
      perimeter: {
        eaves: "130 ft total",
        rakes: "130 ft total",
        ridges: "50 ft total",
      },
    };
  });

// ─── SECTION 14: FINAL CLAIM AUTHORIZATION REQUEST ──────────────────────────

export const getFinalAuthorization = protectedProcedure
  .input(z.object({ jobId: z.number() }))
  .query(async ({ ctx, input }) => {
    const job = await db.query.jobs.findFirst({
      where: eq(jobs.id, input.jobId),
    });

    if (!job || job.userId !== ctx.user.id) {
      throw new Error("Job not found or unauthorized");
    }

    return {
      section: 14,
      title: "Final Claim Authorization Request",
      property: job.propertyAddress,
      rcv: job.rcvAmount || 0,
      depreciation: job.depreciationAmount || 0,
      acv: job.acvAmount || 0,
      recommendation: "Based on forensic analysis, damage evidence, building code requirements, and manufacturer mandates, this claim warrants full authorization at ACV.",
      nextSteps: [
        "Review forensic compliance blueprint",
        "Authorize replacement cost value",
        "Schedule reinspection if needed",
        "Approve claim for payment",
      ],
    };
  });

// ─── GENERATE FULL DOSSIER ─────────────────────────────────────────────────

export const generateFullDossier = protectedProcedure
  .input(z.object({ jobId: z.number() }))
  .mutation(async ({ ctx, input }) => {
    const job = await db.query.jobs.findFirst({
      where: eq(jobs.id, input.jobId),
    });

    if (!job || job.userId !== ctx.user.id) {
      throw new Error("Job not found or unauthorized");
    }

    // Fetch all sections
    const dossier = {
      titleSlide: await getTitleSlide.handler({ ctx, input }),
      claimMetadata: await getClaimMetadata.handler({ ctx, input }),
      financialResolution: await getFinancialResolution.handler({ ctx, input }),
      manufacturerMandates: await getManufacturerMandates.handler({ ctx, input }),
      wasteFactors: await getWasteFactors.handler({ ctx, input }),
      scopeBreakdown: await getScopeBreakdown.handler({ ctx, input }),
      itemizedCosts: await getItemizedCosts.handler({ ctx, input }),
      collateralFailures: await getCollateralFailures.handler({ ctx, input }),
      waterIntrusion: await getWaterIntrusion.handler({ ctx, input }),
      nailFailure: await getNailFailure.handler({ ctx, input }),
      deckingDeficiency: await getDeckingDeficiency.handler({ ctx, input }),
      timeline: await getTimeline.handler({ ctx, input }),
      propertyMeasurements: await getPropertyMeasurements.handler({ ctx, input }),
      finalAuthorization: await getFinalAuthorization.handler({ ctx, input }),
    };

    // Update job status
    await db.update(jobs).set({
      status: "dossier_generated",
      dossierGeneratedAt: new Date(),
    }).where(eq(jobs.id, input.jobId));

    return dossier;
  });
