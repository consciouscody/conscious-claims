import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import {
  FileText,
  Camera,
  Mail,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Shield,
  Zap,
  DollarSign,
  Building2,
} from "lucide-react";

const FEATURES = [
  {
    icon: FileText,
    title: "Xactimate PDF Analysis",
    desc: "Upload any Xactimate estimate and our engine automatically identifies every missing line item — starter shingles, drip edge, valley metal, pipe boots, and more.",
  },
  {
    icon: Camera,
    title: "AI Photo Analysis",
    desc: "Upload roof photos and our AI identifies visual evidence of supplement items — multiple shingle layers, damaged flashing, missing valley metal — and maps them to Xactimate codes.",
  },
  {
    icon: Mail,
    title: "Smart Adjuster Emails",
    desc: "Generate professional, code-referenced supplement request emails in seconds. Each email cites IRC codes, manufacturer requirements, and field conditions.",
  },
  {
    icon: TrendingUp,
    title: "Supplement Tracking",
    desc: "Track every claim from draft to paid. Know exactly which supplements are submitted, approved, denied, and how much has been recovered.",
  },
  {
    icon: DollarSign,
    title: "Fee Calculator",
    desc: "Automatically calculate your percentage-based fee on every recovered supplement. See your earnings per job and across your entire portfolio.",
  },
  {
    icon: Shield,
    title: "Code & Manufacturer Database",
    desc: "Built-in reference library of IRC building codes, Xactimate line item codes, and manufacturer installation requirements — the justification you need to win every supplement.",
  },
];

const COMMONLY_MISSED = [
  { code: "RFG STRT", name: "Starter Shingles" },
  { code: "RFG DRIP", name: "Drip Edge (Eaves & Rakes)" },
  { code: "RFG VMTL", name: "Valley Metal" },
  { code: "RFG STPFLSH", name: "Step Flashing" },
  { code: "RFG FLPIPE", name: "Pipe Boot Flashings" },
  { code: "RFG ICEWATER", name: "Ice & Water Shield" },
  { code: "GUT D&R", name: "Gutter Detach & Reset" },
  { code: "PERMIT", name: "Building Permit" },
];

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  const handleCTA = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      window.location.href = getLoginUrl();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Building2 className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">SupplementAI</span>
          </div>
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
                  <Button size="sm" onClick={handleCTA}>
                    Get Started Free
                  </Button>
                </>
              )
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-[oklch(0.22_0.08_250)] text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-accent blur-3xl" />
        </div>
        <div className="container relative py-24 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
              <Zap className="w-3.5 h-3.5 text-accent" />
              <span>AI-Powered Roofing Supplement Recovery</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight mb-6">
              Recover Every Dollar
              <span className="block text-accent">Adjusters Leave Behind</span>
            </h1>
            <p className="text-lg lg:text-xl text-white/80 mb-8 max-w-2xl">
              Upload an Xactimate estimate, get a complete supplement report with every missing line item, Xactimate codes, code references, and a professional adjuster email — in under 5 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold text-base px-8"
                onClick={handleCTA}
              >
                Start Your First Supplement
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white bg-white/10 hover:bg-white/20 font-semibold text-base"
                onClick={handleCTA}
              >
                View Demo
              </Button>
            </div>
            <p className="mt-4 text-sm text-white/60">No credit card required. Free to start.</p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-white">
        <div className="container py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: "$3,000–$15,000", label: "Average supplement per job" },
              { value: "18+", label: "Commonly missed line items" },
              { value: "< 5 min", label: "From upload to email draft" },
              { value: "10–15%", label: "Your fee on recovered amount" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl lg:text-3xl font-extrabold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commonly Missed Items */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-3">
              Items Adjusters Routinely Miss
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              These are the most common supplement line items left off original estimates. Each one represents real money your clients are owed.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {COMMONLY_MISSED.map((item) => (
              <div
                key={item.code}
                className="bg-white border border-border rounded-lg p-3 flex items-start gap-2"
              >
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-mono text-muted-foreground">{item.code}</div>
                  <div className="text-sm font-medium text-foreground">{item.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-white border-t border-border">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">Everything You Need to Win Supplements</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Built by someone who has worked in roofing insurance sales. Every feature is designed around how the supplement process actually works.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-xl border border-border bg-background hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-background border-t border-border">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">How It Works</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { step: "1", title: "Create a Job", desc: "Enter the property address, claim number, and adjuster contact info." },
              { step: "2", title: "Upload the Estimate", desc: "Upload the Xactimate PDF. Our AI parses every line item automatically." },
              { step: "3", title: "Review Supplement", desc: "See every missing item with Xactimate codes, quantities, and justifications." },
              { step: "4", title: "Send the Email", desc: "Generate a professional adjuster email with one click. Edit and send." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-lg flex items-center justify-center mx-auto mb-4">
                  {s.step}
                </div>
                <h3 className="font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Start Recovering More on Every Claim</h2>
          <p className="text-white/80 mb-8 max-w-lg mx-auto">
            Join roofing contractors who are using AI to find every supplement dollar they are owed.
          </p>
          <Button
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold text-base px-10"
            onClick={handleCTA}
          >
            Get Started Free
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
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
        </div>
      </footer>
    </div>
  );
}
