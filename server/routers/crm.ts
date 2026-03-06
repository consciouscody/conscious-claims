import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { nanoid } from "nanoid";
import {
  getCrmIntegrationsByUser,
  createCrmIntegration,
  updateCrmIntegration,
  deleteCrmIntegration,
  createJob,
} from "../db";

const CRM_TYPES = ["jobnimbus", "acculynx", "roofr", "contractors_cloud", "hubspot", "zapier"] as const;

export const crmRouter = router({
  // List all CRM integrations for the current user
  list: protectedProcedure.query(({ ctx }) => getCrmIntegrationsByUser(ctx.user.id)),

  // Connect a new CRM integration
  connect: protectedProcedure
    .input(
      z.object({
        crmType: z.enum(CRM_TYPES),
        displayName: z.string().min(1).max(128),
        apiKey: z.string().optional(), // for native API integrations
      })
    )
    .mutation(async ({ ctx, input }) => {
      const webhookSecret = nanoid(32);
      await createCrmIntegration({
        userId: ctx.user.id,
        crmType: input.crmType,
        displayName: input.displayName,
        apiKey: input.apiKey || null,
        webhookSecret,
        status: "active",
        jobsSynced: 0,
      });
      return { success: true, webhookSecret };
    }),

  // Update an existing integration (e.g. update API key)
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        displayName: z.string().min(1).max(128).optional(),
        apiKey: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await updateCrmIntegration(id, ctx.user.id, data);
      return { success: true };
    }),

  // Disconnect (delete) a CRM integration
  disconnect: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await deleteCrmIntegration(input.id, ctx.user.id);
      return { success: true };
    }),

  // Test a native API connection (JobNimbus / AccuLynx)
  testConnection: protectedProcedure
    .input(
      z.object({
        crmType: z.enum(["jobnimbus", "acculynx"]),
        apiKey: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        if (input.crmType === "jobnimbus") {
          const res = await fetch("https://app.jobnimbus.com/api1/jobs?limit=1", {
            headers: {
              Authorization: `Bearer ${input.apiKey}`,
              "Content-Type": "application/json",
            },
          });
          if (!res.ok) throw new Error(`JobNimbus API returned ${res.status}`);
          return { success: true, message: "Connected to JobNimbus successfully" };
        }

        if (input.crmType === "acculynx") {
          const res = await fetch("https://api.acculynx.com/api/v2/jobs?pageSize=1", {
            headers: {
              Authorization: `Bearer ${input.apiKey}`,
              "Content-Type": "application/json",
            },
          });
          if (!res.ok) throw new Error(`AccuLynx API returned ${res.status}`);
          return { success: true, message: "Connected to AccuLynx successfully" };
        }

        return { success: false, message: "Unsupported CRM type for direct test" };
      } catch (err: any) {
        return { success: false, message: err.message || "Connection failed" };
      }
    }),

  // Sync jobs from a native API integration (JobNimbus or AccuLynx)
  syncJobs: protectedProcedure
    .input(z.object({ integrationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const integrations = await getCrmIntegrationsByUser(ctx.user.id);
      const integration = integrations.find((i) => i.id === input.integrationId);
      if (!integration) throw new Error("Integration not found");
      if (!integration.apiKey) throw new Error("No API key configured for this integration");

      let imported = 0;
      const errors: string[] = [];

      try {
        if (integration.crmType === "jobnimbus") {
          const res = await fetch("https://app.jobnimbus.com/api1/jobs?limit=50&sort=-date_created", {
            headers: { Authorization: `Bearer ${integration.apiKey}` },
          });
          if (!res.ok) throw new Error(`JobNimbus API error: ${res.status}`);
          const data = await res.json();
          const jnJobs = data.results || [];

          for (const jnJob of jnJobs) {
            try {
              const address = [
                jnJob.location?.street,
                jnJob.location?.city,
                jnJob.location?.state,
                jnJob.location?.zip,
              ]
                .filter(Boolean)
                .join(", ");

              await createJob({
                userId: ctx.user.id,
                propertyAddress: address || jnJob.name || "Unknown Address",
                homeownerName: jnJob.customer?.name || null,
                claimNumber: jnJob.number || null,
                notes: `Imported from JobNimbus (ID: ${jnJob.jnid})`,
                status: "draft",
                feePercentage: "12.00",
              });
              imported++;
            } catch {
              errors.push(`Failed to import job ${jnJob.jnid}`);
            }
          }
        }

        if (integration.crmType === "acculynx") {
          const res = await fetch("https://api.acculynx.com/api/v2/jobs?pageSize=50", {
            headers: { Authorization: `Bearer ${integration.apiKey}` },
          });
          if (!res.ok) throw new Error(`AccuLynx API error: ${res.status}`);
          const data = await res.json();
          const axJobs = data.items || [];

          for (const axJob of axJobs) {
            try {
              await createJob({
                userId: ctx.user.id,
                propertyAddress: axJob.address?.fullAddress || axJob.address?.street || "Unknown Address",
                homeownerName: axJob.customer?.name || null,
                claimNumber: axJob.claimNumber || null,
                insuranceCarrier: axJob.insuranceCompany || null,
                notes: `Imported from AccuLynx (ID: ${axJob.id})`,
                status: "draft",
                feePercentage: "12.00",
              });
              imported++;
            } catch {
              errors.push(`Failed to import job ${axJob.id}`);
            }
          }
        }

        await updateCrmIntegration(integration.id, ctx.user.id, {
          lastSyncAt: new Date(),
          lastSyncStatus: `Synced ${imported} jobs${errors.length ? `, ${errors.length} errors` : ""}`,
          jobsSynced: (integration.jobsSynced || 0) + imported,
        });

        return { success: true, imported, errors };
      } catch (err: any) {
        await updateCrmIntegration(integration.id, ctx.user.id, {
          status: "error",
          lastSyncStatus: err.message || "Sync failed",
        });
        throw err;
      }
    }),
});
