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
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663360996271/3ZX44EBEWux9xrkumJtpAc/favicon_24766f08.png"
              alt="Conscious Capital"
              className="w-8 h-8 rounded-lg object-cover"
            />
            <span className="font-bold text-lg text-foreground">SupplementAI</span>
            <span className="hidden sm:inline text-xs text-muted-foreground font-normal">by Conscious Capital</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/pricing")} className="hidden sm:flex">
              Pricing
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/free-guide")} className="hidden sm:flex text-orange-600 font-semibold">
              Free Guide
            </Button>
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

      {/* E-Book Banner */}
      <section className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white">
        <div className="container py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 rounded-xl p-3 flex-shrink-0">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-orange-100 mb-0.5">FREE Download — No Credit Card</div>
                <div className="text-lg sm:text-xl font-black text-white leading-tight">
                  "Roofing Psychology at the Door" — The Supplement Playbook
                </div>
                <div className="text-sm text-orange-100 mt-0.5">
                  Frame control, mirror effect, 10 scripted objections &amp; closing psychology. Free.
                </div>
              </div>
            </div>
            <Button
              size="lg"
              className="bg-white text-orange-600 hover:bg-orange-50 font-black text-base px-8 py-5 rounded-xl shadow-lg flex-shrink-0 whitespace-nowrap"
              onClick={() => navigate("/free-guide")}
            >
              Download Free Now →
            </Button>
          </div>
        </div>
      </section>

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
              <span>Consciously Supplement with Confidence</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight mb-6">
              Consciously Supplement
              <span className="block text-accent">Own Every Outcome.</span>
            </h1>
            <p className="text-lg lg:text-xl text-white/80 mb-8 max-w-2xl">
              Stop outsourcing your supplements to middlemen. Upload your Xactimate estimate, get every missing line item, code reference, and a professional adjuster email — in under 5 minutes. No specialists. No splits. Full control.
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
                onClick={() => navigate("/demo")}
              >
                View Demo
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-orange-400/60 text-orange-300 bg-orange-500/10 hover:bg-orange-500/20 font-semibold text-base"
                onClick={() => navigate("/free-guide")}
              >
                Free Supplement Guide
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

      {/* Team / About Section */}
      <section className="py-20 bg-background border-t border-border">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-foreground mb-3">Built by Someone Who's Been in the Field</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              SupplementAI was built by a roofing insurance sales professional who got tired of watching contractors leave money on the table. Every feature comes from real-world experience.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            {/* Founder Feature */}
            <div className="grid md:grid-cols-2 gap-10 items-center mb-16">
              <div className="relative">
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/310519663360996271/3ZX44EBEWux9xrkumJtpAc/generated-image-1(57)_cc50cb7f.png"
                  alt="Cody Tyler McCain — Founder, Conscious Capital"
                  className="w-full rounded-2xl object-cover shadow-xl aspect-[3/4] object-top"
                />
                <div className="absolute bottom-4 left-4 right-4 bg-primary/90 backdrop-blur-sm rounded-xl p-4 text-white">
                  <div className="font-bold text-lg">Cody Tyler McCain</div>
                  <div className="text-sm text-white/80">Founder & CEO, Conscious Capital</div>
                  <div className="text-xs text-white/60 mt-1">Atlanta, Georgia</div>
                </div>
              </div>
              <div>
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-semibold mb-4">
                  <Zap className="w-3 h-3" />
                  Founder's Story
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  I built the tool I wish I had when I was in the field.
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  After years working in roofing insurance sales across the Southeast, I watched contractor after contractor leave $3,000–$15,000 per job on the table — not because they didn't deserve it, but because they didn't have the time or the tools to fight for every line item.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Supplement specialists were taking 30–50% cuts. Adjusters were banking on contractors not knowing the codes. I decided to change that.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  SupplementAI gives every roofing contractor the same knowledge, the same codes, and the same professional edge — without giving up a percentage of what they earned.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Years in roofing insurance sales</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Built for contractors, by a contractor</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Speaking / Authority Photo */}
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663360996271/3ZX44EBEWux9xrkumJtpAc/generated-image-1(60)_da73fc4b.png"
                alt="Cody Tyler McCain speaking at a roofing industry event"
                className="w-full object-cover max-h-96 object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex items-end">
                <div className="p-8 text-white">
                  <p className="text-xl font-bold mb-1">"Stop splitting your supplements. Own every outcome."</p>
                  <p className="text-white/70 text-sm">— Cody Tyler McCain, Founder of SupplementAI</p>
                </div>
              </div>
            </div>
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
          <div className="flex items-center gap-6">
            <button onClick={() => navigate("/pricing")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</button>
            <button onClick={() => window.location.href = getLoginUrl()} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign In</button>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SupplementAI by Conscious Capital.
          </p>
        </div>
      </footer>
    </div>
  );
}
