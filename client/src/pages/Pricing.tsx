import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { CheckCircle, Zap, Shield, Building2, ArrowRight, Star } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const PLANS = {
  monthly: [
    {
      id: "starter",
      name: "Starter",
      price: 97,
      period: "month",
      description: "For contractors just getting started with supplements.",
      features: [
        "Up to 10 jobs per month",
        "Xactimate PDF analysis",
        "AI supplement detection",
        "Adjuster email generation",
        "Supplement tracking dashboard",
        "Code & manufacturer database",
        "Email support",
      ],
      cta: "Start Free Trial",
      highlight: false,
      priceId: "starter_monthly",
    },
    {
      id: "pro",
      name: "Pro",
      price: 197,
      period: "month",
      description: "For active contractors running 10+ jobs a month.",
      features: [
        "Unlimited jobs",
        "Everything in Starter",
        "AI photo analysis",
        "PDF export & print-ready reports",
        "Fee calculator & earnings tracker",
        "Priority email support",
        "Early access to new features",
      ],
      cta: "Start Free Trial",
      highlight: true,
      badge: "Most Popular",
      priceId: "pro_monthly",
    },
    {
      id: "agency",
      name: "Agency",
      price: 397,
      period: "month",
      description: "For roofing companies managing multiple crews and claims.",
      features: [
        "Everything in Pro",
        "Up to 5 team members",
        "Team performance dashboard",
        "White-label adjuster emails",
        "Bulk job import",
        "Dedicated account manager",
        "Phone & priority support",
      ],
      cta: "Contact Us",
      highlight: false,
      priceId: "agency_monthly",
    },
  ],
  annual: [
    {
      id: "starter",
      name: "Starter",
      price: 79,
      period: "month",
      billed: "billed annually ($948/yr)",
      description: "For contractors just getting started with supplements.",
      features: [
        "Up to 10 jobs per month",
        "Xactimate PDF analysis",
        "AI supplement detection",
        "Adjuster email generation",
        "Supplement tracking dashboard",
        "Code & manufacturer database",
        "Email support",
      ],
      cta: "Start Free Trial",
      highlight: false,
      savings: "Save $216/yr",
      priceId: "starter_annual",
    },
    {
      id: "pro",
      name: "Pro",
      price: 159,
      period: "month",
      billed: "billed annually ($1,908/yr)",
      description: "For active contractors running 10+ jobs a month.",
      features: [
        "Unlimited jobs",
        "Everything in Starter",
        "AI photo analysis",
        "PDF export & print-ready reports",
        "Fee calculator & earnings tracker",
        "Priority email support",
        "Early access to new features",
      ],
      cta: "Start Free Trial",
      highlight: true,
      badge: "Most Popular",
      savings: "Save $456/yr",
      priceId: "pro_annual",
    },
    {
      id: "agency",
      name: "Agency",
      price: 319,
      period: "month",
      billed: "billed annually ($3,828/yr)",
      description: "For roofing companies managing multiple crews and claims.",
      features: [
        "Everything in Pro",
        "Up to 5 team members",
        "Team performance dashboard",
        "White-label adjuster emails",
        "Bulk job import",
        "Dedicated account manager",
        "Phone & priority support",
      ],
      cta: "Contact Us",
      highlight: false,
      savings: "Save $936/yr",
      priceId: "agency_annual",
    },
  ],
};

export default function Pricing() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");

  const createCheckout = trpc.stripe.createSubscriptionCheckout.useMutation({
    onSuccess: (data: { url: string | null }) => {
      if (data?.url) {
        window.open(data.url, "_blank");
        toast.info("Redirecting to checkout...");
      }
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message || "Failed to start checkout");
    },
  });

  const handlePlanCTA = (plan: typeof PLANS.monthly[0]) => {
    if (plan.id === "agency") {
      window.location.href = "mailto:cody@conscioussupplements.com?subject=Agency Plan Inquiry";
      return;
    }
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    createCheckout.mutate({
      priceId: plan.priceId,
      origin: window.location.origin,
    });
  };

  const plans = PLANS[billing];

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border bg-[#0a0f1e]/95 backdrop-blur-sm sticky top-0 z-50 border-b border-[#c9a84c]/20">
        <div className="container flex items-center justify-between h-16">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663360996271/3ZX44EBEWux9xrkumJtpAc/cc_logo_transparent_0cf366e7.png"
              alt="Conscious Capital"
              className="w-8 h-8 rounded-lg object-cover"
            />
            <span className="font-bold text-lg text-foreground">SupplementAI</span>
            <span className="hidden sm:inline text-xs text-muted-foreground font-normal">by Conscious Capital</span>
          </button>
          <div className="flex items-center gap-3">
            {!loading && (
              isAuthenticated ? (
                <Button onClick={() => navigate("/dashboard")} size="sm">
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={() => window.location.href = getLoginUrl()}>
                    Sign In
                  </Button>
                  <Button size="sm" onClick={() => window.location.href = getLoginUrl()}>
                    Get Started Free
                  </Button>
                </>
              )
            )}
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="bg-gradient-to-br from-[#0a0f1e] via-[#0d1526] to-[#111827] text-white py-20 border-b border-[#c9a84c]/20">
        <div className="container text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
            <Zap className="w-3.5 h-3.5 text-accent" />
            <span>Simple, transparent pricing</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-4">
            Invest in Every Supplement.
            <span className="block text-accent">Keep Every Dollar.</span>
          </h1>
          <p className="text-white/80 max-w-xl mx-auto text-lg mb-8">
            One supplement recovered pays for months of SupplementAI. No commissions. No splits. Just your tool, your results.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-white/10 border border-white/20 rounded-full p-1">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                billing === "monthly" ? "bg-white text-primary" : "text-white/70 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("annual")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                billing === "annual" ? "bg-white text-primary" : "text-white/70 hover:text-white"
              }`}
            >
              Annual
              <span className="bg-accent text-accent-foreground text-xs px-2 py-0.5 rounded-full font-semibold">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl border-2 p-8 flex flex-col ${
                  plan.highlight
                    ? "border-[#c9a84c] bg-[#0d1526] text-white shadow-2xl scale-105 ring-2 ring-[#c9a84c]/30"
                    : "border-[#1e2a3a] bg-[#111827]"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-accent text-accent-foreground text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {plan.badge}
                    </span>
                  </div>
                )}
                {"savings" in plan && plan.savings && (
                  <div className={`text-xs font-semibold mb-3 ${plan.highlight ? "text-[#c9a84c]" : "text-[#c9a84c]"}`}>
                    {plan.savings}
                  </div>
                )}
                <div className="mb-6">
                  <h3 className={`text-xl font-bold mb-1 ${plan.highlight ? "text-[#c9a84c]" : "text-[#c9a84c]"}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm mb-4 ${plan.highlight ? "text-white/70" : "text-gray-400"}`}>
                    {plan.description}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-extrabold ${plan.highlight ? "text-white" : "text-white"}`}>
                      ${plan.price}
                    </span>
                    <span className={`text-sm ${plan.highlight ? "text-white/60" : "text-gray-400"}`}>
                      /{plan.period}
                    </span>
                  </div>
                  {"billed" in plan && plan.billed && (
                    <p className={`text-xs mt-1 ${plan.highlight ? "text-white/50" : "text-muted-foreground"}`}>
                      {plan.billed}
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <CheckCircle
                        className={`w-4 h-4 mt-0.5 shrink-0 text-[#c9a84c]`}
                      />
                      <span className={`text-sm ${plan.highlight ? "text-white/90" : "text-gray-300"}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  size="lg"
                  className={`w-full font-semibold ${
                    plan.highlight
                      ? "bg-[#c9a84c] text-[#0a0f1e] hover:bg-[#b8963e] font-bold"
                      : "bg-[#c9a84c] text-[#0a0f1e] hover:bg-[#b8963e] font-bold"
                  }`}
                  onClick={() => handlePlanCTA(plan)}
                  disabled={createCheckout.isPending}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              <span>14-day free trial, no credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span>Instant access after signup</span>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Calculator Section */}
      <section className="py-16 bg-white border-t border-border">
        <div className="container max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">The Math Is Simple</h2>
          <p className="text-muted-foreground mb-10">
            One supplement recovered pays for SupplementAI many times over. Here is what the numbers look like.
          </p>
          <div className="grid grid-cols-3 gap-6">
            {[
              { label: "Average supplement recovered", value: "$6,500" },
              { label: "Your 12% fee", value: "$780" },
              { label: "SupplementAI Pro cost", value: "$197/mo" },
            ].map((item) => (
              <div key={item.label} className="bg-background rounded-xl border border-border p-6">
                <div className="text-3xl font-extrabold text-primary mb-2">{item.value}</div>
                <div className="text-sm text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </div>
          <p className="mt-8 text-lg font-semibold text-foreground">
            One job pays for 4 months of Pro. Every job after that is pure profit.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-white py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <Building2 className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">SupplementAI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SupplementAI. Built for roofing professionals.
          </p>
          <button onClick={() => navigate("/")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back to Home
          </button>
        </div>
      </footer>
    </div>
  );
}
