import { Link } from "wouter";
import { Droplets, CheckCircle, AlertTriangle, ArrowRight, Zap, FileText, Mail, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

const MISSED_ITEMS = [
  { code: "WTR EXTR", label: "Water Extraction", desc: "Adjusters frequently miss secondary extraction charges and equipment mobilization fees" },
  { code: "DH EQUIP", label: "Dehumidifier Placement", desc: "Number of units, daily rental, and monitoring visits often undercounted" },
  { code: "AF EQUIP", label: "Air Mover Equipment", desc: "Quantity and duration of air movers routinely left off or underestimated" },
  { code: "CONT MAN", label: "Content Manipulation", desc: "Moving furniture and belongings to dry affected areas — almost always missed" },
  { code: "ANTIMICR", label: "Antimicrobial Treatment", desc: "Required by IICRC S500 on Category 2 & 3 losses — frequently omitted entirely" },
  { code: "DEMO LAB", label: "Demolition Labor", desc: "Drywall, flooring, and insulation removal scope routinely underwritten" },
  { code: "STRUCT DRY", label: "Structural Drying", desc: "Wall cavity drying, floor system drying, and monitoring logs often excluded" },
  { code: "MOLD REM", label: "Mold Remediation Protocol", desc: "Post-loss mold treatment and clearance testing left off estimates regularly" },
  { code: "ODOR TRT", label: "Odor Treatment", desc: "Thermal fogging and hydroxyl treatment missed on Category 3 losses" },
  { code: "AFTER HR", label: "After-Hours Emergency Labor", desc: "Emergency response labor rates and after-hours premiums rarely included" },
  { code: "PACK OUT", label: "Pack-Out & Storage", desc: "Content pack-out, inventory, storage, and pack-back all commonly missed" },
  { code: "THERMAL", label: "Thermal Imaging Documentation", desc: "Moisture mapping and thermal imaging documentation fees excluded" },
];

const STATS = [
  { value: "$8K–$25K", label: "Average Recovery Per Loss" },
  { value: "< 5 min", label: "Upload to Email Draft" },
  { value: "12+", label: "Missed Items Per Job" },
  { value: "IICRC S500", label: "Standards Compliant" },
];

export default function WaterRestoration() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      {/* Nav */}
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <Droplets className="w-6 h-6 text-[#c9a84c]" />
            <span className="font-bold text-lg tracking-wide text-white">CONSCIOUS CLAIMS</span>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/pricing">
            <span className="text-white/70 hover:text-white text-sm cursor-pointer">Pricing</span>
          </Link>
          <Link href={user ? "/dashboard" : getLoginUrl()}>
            <Button className="bg-[#c9a84c] hover:bg-[#b8963e] text-black font-bold text-sm px-4 py-2">
              {user ? "Dashboard →" : "Get Started →"}
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-6 py-20 md:py-28 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 border border-[#c9a84c]/40 bg-[#c9a84c]/10 text-[#c9a84c] text-xs font-bold px-3 py-1.5 rounded-full mb-6 tracking-widest uppercase">
              <Droplets className="w-3 h-3" /> Water Restoration Supplements
            </div>
            <h1 className="font-['Barlow_Condensed'] font-black text-5xl md:text-6xl leading-none uppercase mb-4">
              STOP LEAVING<br />
              <span className="text-[#c9a84c]">$8,000–$25K</span><br />
              ON THE TABLE.
            </h1>
            <p className="text-white/70 text-lg leading-relaxed mb-8">
              Upload your water loss estimate and photos. AI finds every missed IICRC line item — dehumidifiers, antimicrobial treatment, content manipulation, structural drying — and writes the adjuster email for you.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href={user ? "/jobs/new" : getLoginUrl()}>
                <Button className="bg-[#c9a84c] hover:bg-[#b8963e] text-black font-bold text-base px-6 py-3">
                  Upload Your First Job <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 font-semibold text-base px-6 py-3">
                  Watch Demo
                </Button>
              </Link>
            </div>
            <p className="text-white/40 text-xs mt-4">First job is free. No credit card required.</p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="bg-[#111827] border border-white/10 rounded-xl p-6 text-center">
                <div className="text-[#c9a84c] font-['Barlow_Condensed'] font-black text-3xl md:text-4xl mb-1">{s.value}</div>
                <div className="text-white/50 text-xs uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-[#0d1220] border-y border-white/10 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-['Barlow_Condensed'] font-black text-4xl uppercase text-center mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <FileText className="w-8 h-8 text-[#c9a84c]" />, step: "01", title: "Upload the Estimate", desc: "Upload the adjuster's Xactimate estimate PDF and your moisture mapping / job photos." },
              { icon: <Zap className="w-8 h-8 text-[#c9a84c]" />, step: "02", title: "AI Finds What's Missing", desc: "The AI cross-references IICRC S500 standards and finds every missed line item with the exact Xactimate code and dollar amount." },
              { icon: <Mail className="w-8 h-8 text-[#c9a84c]" />, step: "03", title: "Send the Supplement", desc: "A professional adjuster email is written and ready to send — no specialists, no splits, full control." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/30 flex items-center justify-center mx-auto mb-4">
                  {item.icon}
                </div>
                <div className="text-[#c9a84c]/50 text-xs font-bold tracking-widest mb-2">STEP {item.step}</div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Missed Items */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-[#c9a84c] text-xs font-bold uppercase tracking-widest mb-3">
            <AlertTriangle className="w-4 h-4" /> What Adjusters Miss
          </div>
          <h2 className="font-['Barlow_Condensed'] font-black text-4xl uppercase">
            12+ Line Items Left Off Every Water Loss
          </h2>
          <p className="text-white/50 text-base mt-3 max-w-xl mx-auto">
            Adjusters handle hundreds of claims. These items get missed — not out of bad faith, but because of workload. Supplements bring them back to their attention professionally.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MISSED_ITEMS.map((item) => (
            <div key={item.code} className="bg-[#111827] border border-white/10 rounded-xl p-5 flex gap-4">
              <CheckCircle className="w-5 h-5 text-[#c9a84c] flex-shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[#c9a84c] font-mono text-xs font-bold bg-[#c9a84c]/10 px-2 py-0.5 rounded">{item.code}</span>
                  <span className="font-semibold text-sm">{item.label}</span>
                </div>
                <p className="text-white/50 text-xs leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Who It's For */}
      <section className="bg-[#0d1220] border-y border-white/10 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-['Barlow_Condensed'] font-black text-4xl uppercase text-center mb-10">
            Built For Every Water Restoration Pro
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Restoration Contractors", desc: "Run every water loss through the AI before submitting. Never leave a line item on the table again." },
              { title: "Public Adjusters", desc: "You get paid a percentage of the claim. The more you find, the more you make. This tool finds more." },
              { title: "Plumbing Contractors", desc: "Water damage from burst pipes and leaks — the AI knows every applicable IICRC code for plumbing losses." },
            ].map((card) => (
              <div key={card.title} className="bg-[#0a0e1a] border border-[#c9a84c]/20 rounded-xl p-6">
                <DollarSign className="w-8 h-8 text-[#c9a84c] mb-3" />
                <h3 className="font-bold text-lg mb-2">{card.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-['Barlow_Condensed'] font-black text-5xl uppercase mb-4">
            Your First Water Loss<br />
            <span className="text-[#c9a84c]">Is Free.</span>
          </h2>
          <p className="text-white/60 text-lg mb-8">
            Upload your estimate and photos. See exactly what was missed. No credit card, no commitment.
          </p>
          <Link href={user ? "/jobs/new" : getLoginUrl()}>
            <Button className="bg-[#c9a84c] hover:bg-[#b8963e] text-black font-black text-lg px-10 py-4">
              Run My First Water Loss Free <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <p className="text-white/30 text-xs mt-4">
            Roofing contractor? <Link href="/"><span className="text-[#c9a84c] underline cursor-pointer">See the roofing supplement tool →</span></Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-6 text-center text-white/30 text-sm">
        <p>© 2025 Conscious Claims. Built by a contractor, for contractors.</p>
        <p className="mt-1">
          <Link href="/"><span className="hover:text-white/60 cursor-pointer">Home</span></Link>
          {" · "}
          <Link href="/pricing"><span className="hover:text-white/60 cursor-pointer">Pricing</span></Link>
          {" · "}
          <Link href="/demo"><span className="hover:text-white/60 cursor-pointer">Demo</span></Link>
        </p>
      </footer>
    </div>
  );
}
