import { useEffect } from "react";
import { trpc } from "@/lib/trpc";

const REFERRAL_STORAGE_KEY = "supplement_ref_code";
const REFERRAL_EXPIRY_KEY = "supplement_ref_expiry";
const REFERRAL_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export function useReferralTracking() {
  const trackClickMutation = trpc.affiliate.trackClick.useMutation();

  useEffect(() => {
    // Parse ?ref= from URL
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get("ref");

    if (refCode) {
      const code = refCode.toUpperCase();
      const expiry = Date.now() + REFERRAL_TTL_MS;

      // Store in localStorage (overwrite any existing code)
      localStorage.setItem(REFERRAL_STORAGE_KEY, code);
      localStorage.setItem(REFERRAL_EXPIRY_KEY, expiry.toString());

      // Track the click server-side
      trackClickMutation.mutate({
        referralCode: code,
        landingPage: window.location.pathname,
        userAgent: navigator.userAgent,
      });
    }
  }, []); // Only run once on mount
}

/**
 * Get the active referral code from localStorage (if not expired).
 * Returns null if no valid referral code is stored.
 */
export function getStoredReferralCode(): string | null {
  try {
    const code = localStorage.getItem(REFERRAL_STORAGE_KEY);
    const expiry = localStorage.getItem(REFERRAL_EXPIRY_KEY);

    if (!code || !expiry) return null;

    if (Date.now() > parseInt(expiry, 10)) {
      // Expired — clean up
      localStorage.removeItem(REFERRAL_STORAGE_KEY);
      localStorage.removeItem(REFERRAL_EXPIRY_KEY);
      return null;
    }

    return code;
  } catch {
    return null;
  }
}

/**
 * Clear the stored referral code (e.g., after a successful conversion).
 */
export function clearStoredReferralCode(): void {
  localStorage.removeItem(REFERRAL_STORAGE_KEY);
  localStorage.removeItem(REFERRAL_EXPIRY_KEY);
}
