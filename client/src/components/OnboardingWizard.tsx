import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Building2,
  Phone,
  Link2,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Zap,
} from "lucide-react";

interface OnboardingWizardProps {
  onComplete: () => void;
}

const STEPS = [
  {
    id: 1,
    icon: Building2,
    title: "Your Company",
    subtitle: "Tell us about your roofing business",
  },
  {
    id: 2,
    icon: Phone,
    title: "Contact Info",
    subtitle: "How can we reach you?",
  },
  {
    id: 3,
    icon: Link2,
    title: "Connect Your CRM",
    subtitle: "Optional — sync jobs automatically",
  },
  {
    id: 4,
    icon: CheckCircle2,
    title: "You're Ready",
    subtitle: "Start recovering money you're owed",
  },
];

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    companyName: "",
    phone: "",
    crmType: "",
  });

  const utils = trpc.useUtils();
  const completeOnboarding = trpc.auth.completeOnboarding.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      onComplete();
    },
    onError: (e) => toast.error(e.message || "Something went wrong"),
  });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleNext = () => {
    if (step === 1 && !form.companyName.trim()) {
      toast.error("Please enter your company name");
      return;
    }
    if (step < 4) {
      setStep((s) => s + 1);
    } else {
      completeOnboarding.mutate(form);
    }
  };

  const currentStep = STEPS[step - 1];
  const StepIcon = currentStep.icon;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={`h-2 rounded-full transition-all duration-300 ${
                s.id === step
                  ? "w-8 bg-primary"
                  : s.id < step
                  ? "w-2 bg-primary/60"
                  : "w-2 bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
          {/* Icon + Title */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <StepIcon className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">{currentStep.title}</h2>
            <p className="text-muted-foreground text-sm mt-1">{currentStep.subtitle}</p>
          </div>

          {/* Step Content */}
          <div className="space-y-4 min-h-[140px]">
            {step === 1 && (
              <div className="space-y-1.5">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  placeholder="e.g. Storm Shield Roofing LLC"
                  value={form.companyName}
                  onChange={set("companyName")}
                  autoFocus
                  className="text-base"
                />
                <p className="text-xs text-muted-foreground">
                  This appears on your supplement reports and adjuster emails.
                </p>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 000-0000"
                  value={form.phone}
                  onChange={set("phone")}
                  autoFocus
                  className="text-base"
                />
                <p className="text-xs text-muted-foreground">
                  Optional — used for account recovery and support.
                </p>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Connect your CRM to automatically sync jobs and photos. You can always do this later in Settings.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {["AccuLynx", "JobNimbus", "Roofr", "Other"].map((crm) => (
                    <button
                      key={crm}
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          crmType: prev.crmType === crm ? "" : crm,
                        }))
                      }
                      className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                        form.crmType === crm
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/60"
                      }`}
                    >
                      {crm}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setForm((prev) => ({ ...prev, crmType: "" }))}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Skip for now — I'll set this up later
                </button>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div className="bg-muted/40 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    <span className="text-sm text-foreground">
                      Company: <strong>{form.companyName}</strong>
                    </span>
                  </div>
                  {form.phone && (
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      <span className="text-sm text-foreground">Phone: {form.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    <span className="text-sm text-foreground">
                      CRM: {form.crmType || "Will set up later"}
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-xl p-4">
                  <Zap className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground">
                    <strong>You're all set.</strong> Upload your first Xactimate estimate and photos — the AI will find every supplement you're owed in under 5 minutes.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            {step > 1 ? (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back
              </button>
            ) : (
              <div />
            )}

            <Button
              onClick={handleNext}
              disabled={completeOnboarding.isPending}
              className="gap-2 min-w-[140px]"
            >
              {completeOnboarding.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : step === 4 ? (
                <>
                  <Zap className="w-4 h-4" />
                  Let's Go
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Skip link */}
        {step < 4 && (
          <p className="text-center mt-4">
            <button
              onClick={() => completeOnboarding.mutate({ companyName: form.companyName || "My Company", phone: form.phone, crmType: form.crmType })}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip setup — I'll fill this in later
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
