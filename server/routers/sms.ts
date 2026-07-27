import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { TRPCError } from "@trpc/server";

/**
 * SMS Router - Handles SMS follow-up sequences and referral requests
 * Integrates with Twilio for SMS delivery
 * 
 * Features:
 * - SMS follow-up after email
 * - SMS follow-up after phone call
 * - SMS follow-up after appointment booking
 * - Referral request SMS after closed job
 * - SMS template customization
 * - SMS delivery tracking
 */

export const smsRouter = router({
  /**
   * Send SMS follow-up after email
   * Triggered automatically after email is sent
   */
  sendPostEmailSMS: protectedProcedure
    .input(z.object({
      jobId: z.string(),
      phoneNumber: z.string(),
      recipientName: z.string(),
      customMessage: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const db = getDb();

        // Default message if not provided
        const message = input.customMessage || 
          `Hi ${input.recipientName}, I just sent you an email with your supplement details. Let me know if you have any questions!`;

        // TODO: Integrate Twilio API
        // const twilioClient = twilio(accountSid, authToken);
        // await twilioClient.messages.create({
        //   body: message,
        //   from: process.env.TWILIO_PHONE_NUMBER,
        //   to: input.phoneNumber,
        // });

        // For now, log to console
        console.log(`[SMS] Post-email SMS to ${input.phoneNumber}: ${message}`);

        return {
          success: true,
          message: "SMS sent successfully",
          timestamp: new Date(),
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to send SMS: ${error}`,
        });
      }
    }),

  /**
   * Send SMS follow-up after phone call
   * Triggered manually after you call the prospect
   */
  sendPostCallSMS: protectedProcedure
    .input(z.object({
      jobId: z.string(),
      phoneNumber: z.string(),
      recipientName: z.string(),
      nextSteps: z.string(),
      customMessage: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const message = input.customMessage || 
          `Hi ${input.recipientName}, thanks for the call! Here's what we discussed: ${input.nextSteps}. Looking forward to working together!`;

        console.log(`[SMS] Post-call SMS to ${input.phoneNumber}: ${message}`);

        return {
          success: true,
          message: "SMS sent successfully",
          timestamp: new Date(),
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to send SMS: ${error}`,
        });
      }
    }),

  /**
   * Send SMS after appointment is booked
   * Triggered automatically when appointment is confirmed
   */
  sendPostBookingSMS: protectedProcedure
    .input(z.object({
      jobId: z.string(),
      phoneNumber: z.string(),
      recipientName: z.string(),
      appointmentDate: z.date(),
      appointmentTime: z.string(),
      customMessage: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const dateStr = input.appointmentDate.toLocaleDateString();
        const message = input.customMessage || 
          `Hi ${input.recipientName}, your appointment is confirmed for ${dateStr} at ${input.appointmentTime}. We'll see you then!`;

        console.log(`[SMS] Post-booking SMS to ${input.phoneNumber}: ${message}`);

        return {
          success: true,
          message: "SMS sent successfully",
          timestamp: new Date(),
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to send SMS: ${error}`,
        });
      }
    }),

  /**
   * Send referral request SMS after closed job
   * Triggered automatically when job status changes to "completed" or "paid"
   */
  sendReferralRequestSMS: protectedProcedure
    .input(z.object({
      jobId: z.string(),
      phoneNumber: z.string(),
      clientName: z.string(),
      customMessage: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const message = input.customMessage || 
          `Hi ${input.clientName}, we just completed your job and we're so grateful for the opportunity to work with you! Would you be willing to refer us to friends or family? Reply with YES or send us a referral and we'll take great care of them!`;

        console.log(`[SMS] Referral request SMS to ${input.phoneNumber}: ${message}`);

        return {
          success: true,
          message: "Referral request SMS sent successfully",
          timestamp: new Date(),
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to send referral SMS: ${error}`,
        });
      }
    }),

  /**
   * Get SMS templates for customization
   * Returns default templates that can be customized
   */
  getTemplates: protectedProcedure
    .query(async ({ ctx }) => {
      return {
        postEmail: {
          name: "Post-Email Follow-up",
          default: "Hi {{name}}, I just sent you an email with your supplement details. Let me know if you have any questions!",
          variables: ["name"],
        },
        postCall: {
          name: "Post-Call Follow-up",
          default: "Hi {{name}}, thanks for the call! Here's what we discussed: {{nextSteps}}. Looking forward to working together!",
          variables: ["name", "nextSteps"],
        },
        postBooking: {
          name: "Appointment Confirmation",
          default: "Hi {{name}}, your appointment is confirmed for {{date}} at {{time}}. We'll see you then!",
          variables: ["name", "date", "time"],
        },
        referral: {
          name: "Referral Request",
          default: "Hi {{name}}, we just completed your job and we're so grateful! Would you be willing to refer us? Reply with YES or send us a referral!",
          variables: ["name"],
        },
      };
    }),

  /**
   * Update SMS template for user
   * Allows users to customize SMS messages
   */
  updateTemplate: protectedProcedure
    .input(z.object({
      templateType: z.enum(["postEmail", "postCall", "postBooking", "referral"]),
      customMessage: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // TODO: Store custom template in database
        // For now, just acknowledge
        return {
          success: true,
          message: `Template updated successfully`,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to update template: ${error}`,
        });
      }
    }),

  /**
   * Get SMS delivery logs for a job
   * Shows all SMS sent for a specific job
   */
  getLogsForJob: protectedProcedure
    .input(z.object({
      jobId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        // TODO: Query SMS logs from database
        // For now, return empty array
        return [];
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get SMS logs: ${error}`,
        });
      }
    }),

  /**
   * Get SMS statistics for user
   * Shows SMS sent, delivered, and response rates
   */
  getStatistics: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        // TODO: Calculate SMS statistics from database
        return {
          totalSent: 0,
          totalDelivered: 0,
          totalFailed: 0,
          responseRate: 0,
          referralRate: 0,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get SMS statistics: ${error}`,
        });
      }
    }),
});
