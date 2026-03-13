import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CreditCard, Zap, CheckCircle2, ArrowRight, Loader2, Star, Building2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 97,
    period: "month",
    priceId: "starter_monthly",
    description: "Perfect for solo contractors getting started",
    features: ["Up to 10 jobs/month", "AI supplement generation", "Adjuster email drafts", "AccuLynx sync", "Email support"],
    highlight: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 197,
    period: "month",
    priceId: "pro_monthly",
    description: "For active contractors running multiple crews",
    features: ["Unlimited jobs", "Priority AI processing", "Branded PDF reports", "CRM integrations", "Phone support", "LinkedIn post generator"],
    highlight: true,
    badge: "Most Popular",
  },
  {
    id: "agency",
    name: "Agency",
    price: 397,
    period: "month",
    priceId: "agency_monthly",
    description: "For roofing companies with multiple users",
    features: ["Everything in Pro", "Up to 5 team members", "White-label reports", "Custom fee structures", "Dedicated account manager", "API access"],
    highlight: false,
  },
];

export default function Billing() {
  const { user } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const createCheckout = trpc.stripe.createSubscriptionCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.success("Redirecting to checkout...");
        window.open(data.url, "_blank");
      }
    },
    onError: (e) => {
      toast.error(e.message || "Failed to start checkout");
      setLoadingPlan(null);
    },
  });

  const handleSelectPlan = (priceId: string) => {
    setLoadingPlan(priceId);
    createCheckout.mutate({
      priceId,
      origin: window.location.origin,
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-primary" />
            Billing & Subscription
          </h1>
          <p className="text-muted-foreground mt-1">
            Choose the plan that fits your business. Cancel anytime.
          </p>
        </div>

        {/* Current Plan Banner */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{user?.companyName || user?.name || "Your Account"}</p>
              <p className="text-sm text-muted-foreground">
                Currently on <span className="font-medium text-primary">Free Trial</span> — upgrade to unlock all features
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span>Test card: 4242 4242 4242 4242</span>
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl border p-6 flex flex-col ${
                plan.highlight
                  ? "border-primary bg-primary text-white shadow-xl shadow-primary/20"
                  : "border-border bg-card"
              }`}
            >
              {plan.badge && (
                <div className="flex items-center gap-1 mb-3">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <span className="text-xs font-bold text-yellow-400 uppercase tracking-wide">{plan.badge}</span>
                </div>
              )}

              <h3 className={`text-xl font-bold mb-1 ${plan.highlight ? "text-white" : "text-foreground"}`}>
                {plan.name}
              </h3>
              <p className={`text-sm mb-4 ${plan.highlight ? "text-white/70" : "text-muted-foreground"}`}>
                {plan.description}
              </p>

              <div className="flex items-baseline gap-1 mb-6">
                <span className={`text-4xl font-extrabold ${plan.highlight ? "text-white" : "text-foreground"}`}>
                  ${plan.price}
                </span>
                <span className={`text-sm ${plan.highlight ? "text-white/60" : "text-muted-foreground"}`}>
                  /month
                </span>
              </div>

              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5">
                    <CheckCircle2 className={`w-4 h-4 shrink-0 ${plan.highlight ? "text-white/80" : "text-green-500"}`} />
                    <span className={`text-sm ${plan.highlight ? "text-white/90" : "text-foreground"}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSelectPlan(plan.priceId)}
                disabled={loadingPlan === plan.priceId || createCheckout.isPending}
                variant={plan.highlight ? "secondary" : "default"}
                className={`w-full gap-2 ${plan.highlight ? "bg-white text-primary hover:bg-white/90" : ""}`}
              >
                {loadingPlan === plan.priceId ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          All plans include a 14-day free trial. No credit card required to start.
          Use test card <strong>4242 4242 4242 4242</strong> with any future date and any CVC to test payments.
        </p>
      </div>
    </DashboardLayout>
  );
}
