/**
 * CRM Webhook Endpoint
 * Receives job data from any CRM via Zapier or direct webhook.
 * URL pattern: POST /api/crm/webhook/:secret
 * The :secret is unique per user integration and acts as authentication.
 */
import { Router, Request, Response } from "express";
import { getCrmIntegrationByWebhookSecret, createJob, updateCrmIntegration } from "./db";

export const crmWebhookRouter = Router();

crmWebhookRouter.post("/api/crm/webhook/:secret", async (req: Request, res: Response) => {
  const { secret } = req.params;

  try {
    // Look up the integration by webhook secret
    const integration = await getCrmIntegrationByWebhookSecret(secret);
    if (!integration) {
      res.status(401).json({ error: "Invalid webhook secret" });
      return;
    }

    const body = req.body || {};

    // Map incoming webhook payload to SupplementAI job fields
    // Supports common field names from JobNimbus, AccuLynx, Roofr, Zapier
    const propertyAddress =
      body.property_address ||
      body.address ||
      body.location ||
      body.street_address ||
      body.job_address ||
      body.site_address ||
      "Unknown Address";

    const homeownerName =
      body.homeowner_name ||
      body.customer_name ||
      body.contact_name ||
      body.client_name ||
      body.insured_name ||
      null;

    const claimNumber =
      body.claim_number ||
      body.claim_no ||
      body.claim ||
      body.insurance_claim ||
      null;

    const insuranceCarrier =
      body.insurance_carrier ||
      body.insurance_company ||
      body.carrier ||
      body.insurer ||
      null;

    const adjusterName =
      body.adjuster_name ||
      body.adjuster ||
      null;

    const adjusterEmail =
      body.adjuster_email ||
      body.adjuster_contact ||
      null;

    const notes = [
      `Imported from ${integration.crmType} via webhook`,
      body.notes || body.description || body.job_notes || "",
    ]
      .filter(Boolean)
      .join(". ");

    // Create the job in SupplementAI
    await createJob({
      userId: integration.userId,
      propertyAddress,
      homeownerName,
      claimNumber,
      insuranceCarrier,
      adjusterName,
      adjusterEmail: adjusterEmail || null,
      notes,
      status: "draft",
      feePercentage: "12.00",
    });

    // Update sync stats
    await updateCrmIntegration(integration.id, integration.userId, {
      lastSyncAt: new Date(),
      lastSyncStatus: `Received job: ${propertyAddress}`,
      jobsSynced: (integration.jobsSynced || 0) + 1,
    });

    res.json({ success: true, message: "Job created in SupplementAI" });
  } catch (err: any) {
    console.error("[CRM Webhook] Error:", err);
    res.status(500).json({ error: err.message || "Webhook processing failed" });
  }
});
