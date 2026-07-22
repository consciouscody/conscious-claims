import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { invokeLLM } from "../_core/llm";
import { TRPCError } from "@trpc/server";

/**
 * Forensic Dossier Generator
 * 
 * Generates a complete, adjuster-proof claim documentation package including:
 * - Forensic damage assessment
 * - Building code justifications
 * - Manufacturer warranty mandates
 * - Waste factor calculations
 * - Collateral damage documentation
 * - 30-day legal demand letter
 */

interface DossierInput {
  jobId: number;
  propertyAddress: string;
  insuredName: string;
  adjusterName: string;
  claimNumber: string;
  lossType: "hail" | "wind" | "water" | "other";
  dateOfLoss: string;
  roofArea: number; // sq ft
  roofPitch: string; // e.g., "6/12"
  damagePhotos: string[]; // URLs
  damageDescription: string;
  estimatedDamageAmount: number;
  adjusterScopeNotes: string;
  collateralDamages: Array<{
    type: string;
    description: string;
    estimatedCost: number;
  }>;
}

const WASTE_FACTORS = {
  synthetic_underlayment: { min: 10, max: 15, reason: "3\" horizontal side laps, 6\" vertical end laps, ridge fold-overs" },
  drip_edge: { min: 10, max: 12, reason: "2\"-3\" seam overlaps, gable mitering, thermal expansion trimming" },
  starter_strips: { min: 5, max: 10, reason: "Continuous application along eaves and rakes for wind warranty" },
  architectural_shingles: { min: 10, max: 15, reason: "EagleView net square footage, pitch geometry, complexity" },
};

const BUILDING_CODES = {
  R905_2_1: "IRC R905.2.1 - Roof covering shall be applied over solid sheathing (5/8\" CDX plywood minimum)",
  R905_2_8_1: "IRC R905.2.8.1 - Underlayment required at all roof penetrations and transitions",
  R905_2_8_5: "IRC R905.2.8.5 - Ice and water barrier required at eaves and valleys",
  R905_7: "IRC R905.7 - Roof deck shall be securely fastened to supporting members",
};

const MANUFACTURER_SPECS = {
  owens_corning: {
    underlayment: "Synthetic underlayment required for warranty compliance",
    starter: "Continuous starter strip required along all eaves and rakes",
    warranty_requirement: "Installation per OC specifications required for 50-year warranty",
  },
  tamko: {
    underlayment: "TAMKO synthetic underlayment mandate for hail-prone areas",
    ice_water: "Ice & water barrier at all penetrations and transitions",
    warranty_requirement: "Professional installation certification required",
  },
};

export const forensicDossierRouter = router({
  /**
   * Generate comprehensive forensic dossier
   */
  generate: protectedProcedure
    .input(
      z.object({
        jobId: z.number(),
        propertyAddress: z.string(),
        insuredName: z.string(),
        adjusterName: z.string(),
        claimNumber: z.string(),
        lossType: z.enum(["hail", "wind", "water", "other"]),
        dateOfLoss: z.string(),
        roofArea: z.number(),
        roofPitch: z.string(),
        damagePhotos: z.array(z.string()).optional(),
        damageDescription: z.string(),
        estimatedDamageAmount: z.number(),
        adjusterScopeNotes: z.string(),
        collateralDamages: z.array(z.object({
          type: z.string(),
          description: z.string(),
          estimatedCost: z.number(),
        })).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Generate dossier sections using AI
        const systemPrompt = `You are an expert forensic roofing damage assessor with 25+ years of experience. 
You generate comprehensive, adjuster-proof claim documentation that cites:
- IRC building codes (R905 series)
- Manufacturer specifications and warranty requirements
- Industry standards (HAAG, IICRC)
- Photographic evidence
- Waste factor justifications
- Collateral damage documentation

Your dossiers are factual, professional, and defensible in any dispute.`;

        const userPrompt = `Generate a forensic claim dossier for:

Property: ${input.propertyAddress}
Insured: ${input.insuredName}
Adjuster: ${input.adjusterName}
Claim #: ${input.claimNumber}
Loss Type: ${input.lossType}
Date of Loss: ${input.dateOfLoss}
Roof Area: ${input.roofArea} sq ft
Pitch: ${input.roofPitch}

Damage Description: ${input.damageDescription}
Initial Estimate: $${input.estimatedDamageAmount}

Adjuster Scope Notes: ${input.adjusterScopeNotes}

Collateral Damages:
${input.collateralDamages?.map(d => `- ${d.type}: ${d.description} ($${d.estimatedCost})`).join("\n") || "None identified"}

Generate a professional forensic dossier with these sections:
1. Financial Summary (RCV, Depreciation, ACV)
2. Building Code Justifications (cite IRC R905.2.1, R905.2.8.1, etc.)
3. Manufacturer Warranty Mandates
4. Waste Factor Justification Table
5. Scope Breakdown with Costs
6. Itemized Cost Breakdown
7. Collateral Component Failures
8. Water Intrusion Analysis
9. Structural Deficiency Evidence
10. Timeline of Damage

Format as a professional report ready for adjuster submission.`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        });

        const dossierContent = (response as any)?.choices?.[0]?.message?.content || "";

        if (!dossierContent) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to generate dossier content",
          });
        }

        // Extract key metrics from the dossier
        const extractMetricsPrompt = `From this forensic dossier, extract JSON with:
{
  "totalRCV": number,
  "totalDepreciation": number,
  "netACV": number,
  "additionalItemsFound": number,
  "keyCodeCitations": ["code1", "code2"],
  "estimatedApprovalRate": "percentage",
  "urgencyLevel": "high|medium|low"
}

Dossier excerpt: ${dossierContent.substring(0, 2000)}`;

        const metricsResponse = await invokeLLM({
          messages: [
            { role: "system", content: "Extract structured data from forensic dossiers. Return only valid JSON." },
            { role: "user", content: extractMetricsPrompt },
          ],
        });

        let metrics = {
          totalRCV: input.estimatedDamageAmount,
          totalDepreciation: 0,
          netACV: input.estimatedDamageAmount,
          additionalItemsFound: 0,
          keyCodeCitations: Object.keys(BUILDING_CODES),
          estimatedApprovalRate: "78%",
          urgencyLevel: "high" as const,
        };

        try {
          const metricsText = (metricsResponse as any)?.choices?.[0]?.message?.content || "{}";
          const jsonMatch = metricsText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            metrics = JSON.parse(jsonMatch[0]);
          }
        } catch (e) {
          // Use defaults if extraction fails
        }

        return {
          success: true,
          dossier: {
            id: `dossier-${input.jobId}-${Date.now()}`,
            jobId: input.jobId,
            claimNumber: input.claimNumber,
            propertyAddress: input.propertyAddress,
            insuredName: input.insuredName,
            adjusterName: input.adjusterName,
            content: dossierContent,
            metrics,
            generatedAt: new Date().toISOString(),
            buildingCodesCited: BUILDING_CODES,
            wasteFactors: WASTE_FACTORS,
          },
        };
      } catch (error) {
        console.error("Forensic dossier generation error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate forensic dossier",
        });
      }
    }),

  /**
   * Get waste factor justification for specific material
   */
  getWasteFactor: protectedProcedure
    .input(z.object({ material: z.string() }))
    .query(({ input }) => {
      const factor = (WASTE_FACTORS as any)[input.material.toLowerCase()];
      if (!factor) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Waste factor not found for material",
        });
      }
      return factor;
    }),

  /**
   * Get all building codes
   */
  getBuildingCodes: protectedProcedure.query(() => BUILDING_CODES),

  /**
   * Get manufacturer specifications
   */
  getManufacturerSpecs: protectedProcedure
    .input(z.object({ manufacturer: z.string() }))
    .query(({ input }) => {
      const specs = (MANUFACTURER_SPECS as any)[input.manufacturer.toLowerCase()];
      if (!specs) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Manufacturer specifications not found",
        });
      }
      return specs;
    }),

  /**
   * Calculate waste factor for roof area
   */
  calculateWasteFactor: protectedProcedure
    .input(z.object({
      material: z.string(),
      roofArea: z.number(),
      pitch: z.string(),
    }))
    .query(({ input }) => {
      const factor = (WASTE_FACTORS as any)[input.material.toLowerCase()];
      if (!factor) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Waste factor not found",
        });
      }

      const wastePercentage = (factor.min + factor.max) / 2;
      const wasteAmount = (input.roofArea * wastePercentage) / 100;

      return {
        material: input.material,
        roofArea: input.roofArea,
        pitch: input.pitch,
        wastePercentage: `${factor.min}-${factor.max}%`,
        wasteAmount,
        reason: factor.reason,
      };
    }),
});
