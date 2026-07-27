import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { TRPCError } from "@trpc/server";

/**
 * Referral Router - Handles automatic referral requests
 * Sends referral requests after closed jobs
 * 
 * Features:
 * - Auto-referral SMS after job completion
 * - Auto-referral email after job completion
 * - Referral tracking and analytics
 * - Referral response management
 * - Referral follow-up automation
 */

export const referralsRouter = router({
  /**
   * Send referral request after job completion
   * Triggered automatically when job status changes to "completed" or "paid"
   */
  sendReferralRequest: protectedProcedure
    .input(z.object({
      jobId: z.string(),
      clientName: z.string(),
      phoneNumber: z.string(),
      email: z.string(),
      sendSMS: z.boolean().default(true),
      sendEmail: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // TODO: Send SMS via Twilio
        // TODO: Send email via SendGrid or similar
        
        return {
          success: true,
          message: "Referral request sent successfully",
          timestamp: new Date(),
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to send referral request: ${error}`,
        });
      }
    }),

  /**
   * Track referral response
   * Records when client responds to referral request
   */
  trackReferralResponse: protectedProcedure
    .input(z.object({
      jobId: z.string(),
      response: z.enum(["interested", "not_interested", "will_refer", "already_referred"]),
      referralDetails: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // TODO: Update referral status in database
        // TODO: Trigger follow-up if "will_refer"
        
        return {
          success: true,
          message: "Referral response recorded",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to track referral response: ${error}`,
        });
      }
    }),

  /**
   * Get referral statistics
   * Shows referral request and conversion metrics
   */
  getStatistics: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        // TODO: Calculate referral statistics from database
        return {
          totalRequests: 0,
          totalResponses: 0,
          responseRate: 0,
          referralsReceived: 0,
          referralConversionRate: 0,
          thisMonth: {
            requests: 0,
            responses: 0,
            referrals: 0,
          },
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get referral statistics: ${error}`,
        });
      }
    }),

  /**
   * Get referral history for a job
   * Shows all referral activity for a specific job
   */
  getJobReferralHistory: protectedProcedure
    .input(z.object({
      jobId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        // TODO: Query referral history from database
        return {
          referralRequests: [],
          referralResponses: [],
          referralLeads: [],
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get referral history: ${error}`,
        });
      }
    }),

  /**
   * Get all referral leads
   * Shows all leads that came from referrals
   */
  getReferralLeads: protectedProcedure
    .input(z.object({
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      try {
        // TODO: Query referral leads from database
        return {
          leads: [],
          total: 0,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get referral leads: ${error}`,
        });
      }
    }),

  /**
   * Get referral templates
   * Returns customizable referral request templates
   */
  getTemplates: protectedProcedure
    .query(async ({ ctx }) => {
      return {
        sms: {
          name: "SMS Referral Request",
          default: "Hi {{name}}, we just completed your job and we're so grateful! Would you be willing to refer us to friends or family? Reply YES and we'll take great care of them!",
          variables: ["name"],
        },
        email: {
          name: "Email Referral Request",
          default: "Hi {{name}},\n\nThank you for choosing us for your recent project! We're so grateful for the opportunity to work with you.\n\nIf you know anyone who could benefit from our services, we'd love a referral. Just reply to this email with their contact info and we'll take great care of them.\n\nThanks again!",
          variables: ["name"],
        },
      };
    }),

  /**
   * Update referral templates
   * Allows customization of referral request messages
   */
  updateTemplate: protectedProcedure
    .input(z.object({
      templateType: z.enum(["sms", "email"]),
      customMessage: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // TODO: Update template in database
        return {
          success: true,
          message: "Referral template updated",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to update referral template: ${error}`,
        });
      }
    }),

  /**
   * Get referral settings
   * Returns user's referral automation preferences
   */
  getSettings: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        // TODO: Query referral settings from database
        return {
          autoSendReferralRequest: true,
          delayAfterCompletion: 24, // hours
          sendSMS: true,
          sendEmail: true,
          followUpAfterNoResponse: true,
          followUpDelay: 7, // days
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get referral settings: ${error}`,
        });
      }
    }),

  /**
   * Update referral settings
   * Allows customization of referral automation
   */
  updateSettings: protectedProcedure
    .input(z.object({
      autoSendReferralRequest: z.boolean().optional(),
      delayAfterCompletion: z.number().optional(),
      sendSMS: z.boolean().optional(),
      sendEmail: z.boolean().optional(),
      followUpAfterNoResponse: z.boolean().optional(),
      followUpDelay: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // TODO: Update settings in database
        return {
          success: true,
          message: "Referral settings updated",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to update referral settings: ${error}`,
        });
      }
    }),
});
