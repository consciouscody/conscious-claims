import { useAuth } from "@/_core/hooks/useAuth";
import { useReferralTracking } from "@/hooks/useReferralTracking";
import EngagementPopup from "@/components/EngagementPopup";
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
  Star,
  ChevronRight,
  Droplets,
} from "lucide-react";

const FEATURES = [
  { icon: FileText, title: "Xactimate PDF Analysis", desc: "Upload any Xactimate estimate and our engine automatically identifies every missing line item — starter shingles, drip edge, valley metal, pipe boots, and more." },
  { icon: Camera, title: "AI Photo Analysis", desc: "Upload roof and water damage photos. AI identifies visual evidence and maps every finding to Xactimate codes automatically." },
  { icon: Droplets, title: "Water Restoration Supplements", desc: "Full IICRC S500 scope analysis for water damage claims. AI finds missed drying equipment, demolition scope, antimicrobial treatments, and structural repairs adjusters leave off." },
  { icon: Mail, title: "Smart Adjuster Emails", desc: "Generate professional, code-referenced supplement request emails in seconds. Each email cites IRC codes, IICRC standards, manufacturer requirements, and field conditions." },
  { icon: TrendingUp, title: "Supplement Tracking", desc: "Track every claim from draft to paid. Know exactly which supplements are submitted, approved, denied, and how much has been recovered." },
  { icon: DollarSign, title: "Fee Calculator", desc: "Automatically calculate your percentage-based fee on every recovered supplement. See your earnings per job and across your entire portfolio." },
  { icon: Shield, title: "Code & Standards Database", desc: "Built-in reference library of IRC building codes, Xactimate line item codes, IICRC S500 water restoration standards, and manufacturer installation requirements." },
];

const COMMONLY_MISSED = [
  { code: "RFG STRT", name: "Starter Shingles", trade: "roofing" },
  { code: "RFG DRIP", name: "Drip Edge (Eaves & Rakes)", trade: "roofing" },
  { code: "RFG VMTL", name: "Valley Metal", trade: "roofing" },
  { code: "RFG STPFLSH", name: "Step Flashing", trade: "roofing" },
  { code: "RFG FLPIPE", name: "Pipe Boot Flashings", trade: "roofing" },
  { code: "RFG ICEWATER", name: "Ice & Water Shield", trade: "roofing" },
  { code: "GUT D&R", name: "Gutter Detach & Reset", trade: "roofing" },
  { code: "PERMIT", name: "Building Permit", trade: "roofing" },
  { code: "WTR AMTRT", name: "Antimicrobial Treatment", trade: "water" },
  { code: "WTR DEHU", name: "Dehumidifier Placement", trade: "water" },
  { code: "WTR DEMO", name: "Drywall Demo & Haul Off", trade: "water" },
  { code: "WTR SUBFLR", name: "Subfloor Removal", trade: "water" },
];

const STATS = [
  { value: "$4,832", label: "Found on first job", highlight: true },
  { value: "$3K–$15K", label: "Average per claim" },
  { value: "< 5 min", label: "Upload to email draft" },
  { value: "18+", label: "Missed items caught" },
];

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  useReferralTracking();

  const handleCTA = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      window.location.href = getLoginUrl();
    }
  };

  return (
    <>
    <EngagementPopup />
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663360996271/3ZX44EBEWux9xrkumJtpAc/cc_logo_transparent_0cf366e7.png"
              alt="Conscious Claims"
              className="w-9 h-9 object-contain"
            />
            <span className="font-bold text-lg text-foreground" style={{fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.05em'}}>CONSCIOUS CLAIMS</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/pricing")} className="hidden sm:flex text-muted-foreground hover:text-foreground">Pricing</Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/free-guide")} className="hidden sm:flex" style={{color:'#f5c842'}}>Free Guide</Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/visibility-audit")} className="hidden sm:flex text-blue-400 font-semibold">Free AI Audit</Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/affiliates")} className="hidden sm:flex text-muted-foreground hover:text-foreground">Affiliates</Button>
            {!loading && (
              isAuthenticated ? (
                <Button onClick={() => navigate("/dashboard")} size="sm" className="btn-gold">Dashboard →</Button>
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={() => window.location.href = getLoginUrl()} className="text-muted-foreground">Sign In</Button>
                  <Button size="sm" className="btn-gold" onClick={handleCTA}>Get Started Free</Button>
                </>
              )
            )}
          </div>
        </div>
      </nav>

      {/* E-Book Banner */}
      <section style={{background:'linear-gradient(90deg, #0a0e1a 0%, #0f1629 100%)', borderBottom:'1px solid rgba(245,200,66,0.3)'}}>
        <div className="container py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg p-2 flex-shrink-0" style={{background:'rgba(245,200,66,0.15)', border:'1px solid rgba(245,200,66,0.3)'}}>
                <FileText className="w-6 h-6" style={{color:'#f5c842'}} />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest" style={{color:'rgba(245,200,66,0.7)'}}>FREE Download — No Credit Card</div>
                <div className="text-base font-black text-white">"Roofing Psychology at the Door" — Free E-Book</div>
              </div>
            </div>
            <Button size="sm" className="btn-gold font-black px-6 flex-shrink-0" onClick={() => navigate("/free-guide")}>
              Download Free →
            </Button>
          </div>
        </div>
      </section>

      {/* HERO */}
      <section className="relative overflow-hidden" style={{background:'linear-gradient(135deg, #0a0e1a 0%, #0f1629 40%, #141e3a 100%)'}}>
        <div className="absolute inset-0 opacity-25">
          <video autoPlay muted loop playsInline className="w-full h-full object-cover">
            <source src="https://d2xsxph8kpxj0f.cloudfront.net/310519663360996271/3ZX44EBEWux9xrkumJtpAc/higgsfield_hero_066bdd98.mp4" type="video/mp4" />
            <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663360996271/3ZX44EBEWux9xrkumJtpAc/ad_adjuster_roof_dffcf998.png" alt="" className="w-full h-full object-cover" />
          </video>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-15" style={{background:'radial-gradient(circle, #f5c842 0%, transparent 70%)', transform:'translate(30%, -30%)'}} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10" style={{background:'radial-gradient(circle, #f5c842 0%, transparent 70%)', transform:'translate(-30%, 30%)'}} />

        <div className="container relative py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold mb-6 border" style={{background:'rgba(245,200,66,0.1)', borderColor:'rgba(245,200,66,0.3)', color:'#f5c842'}}>
                <Zap className="w-3 h-3" />
                YOU'RE SEEING IT EARLY — EARLY ACCESS OPEN
              </div>
              <h1 className="text-5xl lg:text-7xl font-black leading-none mb-4 text-white" style={{fontFamily:"'Barlow Condensed', sans-serif"}}>
                STOP LEAVING
                <span className="block" style={{color:'#f5c842'}}>$4,832</span>
                ON THE TABLE.
              </h1>
              <p className="text-lg text-gray-300 mb-8 max-w-lg leading-relaxed">
                Upload your estimate and photos. AI finds every missed Xactimate line item, codes it, and writes the adjuster email — in under 5 minutes. No specialists. No splits. Full control.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <Button size="lg" className="btn-gold text-base px-8 py-6 text-lg" onClick={handleCTA}>
                  Start Your First Supplement
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="border-white/20 text-white bg-white/5 hover:bg-white/10 text-base px-8 py-6" onClick={() => navigate("/demo")}>
                  Watch Demo
                </Button>
              </div>
              <p className="text-sm text-gray-500">No credit card required. Free to start. Built by a contractor.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {STATS.map((stat) => (
                <div key={stat.label} className="rounded-2xl p-6 text-center" style={{
                  background: stat.highlight ? 'linear-gradient(135deg, rgba(245,200,66,0.15) 0%, rgba(245,200,66,0.05) 100%)' : 'rgba(255,255,255,0.04)',
                  border: stat.highlight ? '1px solid rgba(245,200,66,0.4)' : '1px solid rgba(255,255,255,0.08)',
                }}>
                  <div className="text-3xl lg:text-4xl font-black mb-1" style={{fontFamily:"'Barlow Condensed', sans-serif", color: stat.highlight ? '#f5c842' : '#ffffff'}}>{stat.value}</div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
              <div className="col-span-2 rounded-2xl overflow-hidden relative" style={{height:'200px'}}>
                <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663360996271/3ZX44EBEWux9xrkumJtpAc/ad_contractor_tablet_b5e381c3.png" alt="Roofing contractor showing supplement report to adjuster" className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{background:'linear-gradient(to top, rgba(10,14,26,0.85) 0%, transparent 60%)'}} />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="text-white font-bold text-sm">"This is revolutionary. A game changer."</div>
                  <div className="text-gray-400 text-xs mt-0.5">— Built by a contractor, for contractors</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20" style={{background:'#0d1120'}}>
        <div className="container">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold mb-4 border" style={{background:'rgba(245,200,66,0.08)', borderColor:'rgba(245,200,66,0.2)', color:'#f5c842'}}>HOW IT WORKS</div>
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-3" style={{fontFamily:"'Barlow Condensed', sans-serif"}}>FROM UPLOAD TO APPROVED IN MINUTES</h2>
            <p className="text-gray-400 max-w-xl mx-auto">No learning curve. No specialist needed. Just upload and let the AI do the work.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { step: "01", title: "Create a Job", desc: "Enter the property address, claim number, and adjuster info.", icon: Building2 },
              { step: "02", title: "Upload Estimate", desc: "Upload the Xactimate PDF. AI parses every line item automatically.", icon: FileText },
              { step: "03", title: "Review Supplement", desc: "See every missing item with codes, quantities, and dollar amounts.", icon: CheckCircle },
              { step: "04", title: "Send the Email", desc: "One-click professional adjuster email. Edit and send in seconds.", icon: Mail },
            ].map((s) => (
              <div key={s.step} className="rounded-2xl p-6" style={{background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)'}}>
                <div className="text-5xl font-black mb-3" style={{fontFamily:"'Barlow Condensed', sans-serif", color:'rgba(245,200,66,0.2)'}}>{s.step}</div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{background:'rgba(245,200,66,0.1)'}}>
                  <s.icon className="w-5 h-5" style={{color:'#f5c842'}} />
                </div>
                <h3 className="font-bold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commonly Missed Items */}
      <section className="py-16" style={{background:'#0a0e1a'}}>
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-3xl lg:text-4xl font-black text-white mb-3" style={{fontFamily:"'Barlow Condensed', sans-serif"}}>ITEMS ADJUSTERS ROUTINELY MISS</h2>
            <p className="text-gray-400 max-w-xl mx-auto text-sm">Each one is real money your clients are owed. We catch all of them automatically.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {COMMONLY_MISSED.map((item) => (
              <div key={item.code} className="rounded-xl p-4 flex items-start gap-3" style={{background:'rgba(255,255,255,0.03)', border:'1px solid rgba(245,200,66,0.15)'}}>
                <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{color:'#f5c842'}} />
                <div>
                  <div className="text-xs font-mono" style={{color:'rgba(245,200,66,0.6)'}}>{item.code}</div>
                  <div className="text-sm font-semibold text-white">{item.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20" style={{background:'#0d1120'}}>
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-3" style={{fontFamily:"'Barlow Condensed', sans-serif"}}>EVERYTHING YOU NEED TO WIN</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Built by someone who has worked in roofing insurance sales. Every feature is designed around how the supplement process actually works.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feature, i) => (
              <div key={feature.title} className="rounded-2xl p-6" style={{
                background: i === 0 ? 'linear-gradient(135deg, rgba(245,200,66,0.12) 0%, rgba(245,200,66,0.03) 100%)' : 'rgba(255,255,255,0.03)',
                border: i === 0 ? '1px solid rgba(245,200,66,0.35)' : '1px solid rgba(255,255,255,0.07)',
              }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{background:'rgba(245,200,66,0.1)'}}>
                  <feature.icon className="w-6 h-6" style={{color:'#f5c842'}} />
                </div>
                <h3 className="font-bold text-white mb-2 text-lg">{feature.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-20" style={{background:'linear-gradient(135deg, #0a0e1a 0%, #0f1a2e 100%)'}}>
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl opacity-30" style={{background:'linear-gradient(135deg, #f5c842 0%, transparent 60%)', transform:'translate(8px, 8px)'}} />
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663360996271/3ZX44EBEWux9xrkumJtpAc/contractor_phone_hero-ngAUuDw7fx3JamrF7EsCyT.png"
                alt="Cody Tyler McCain — Founder, Conscious Capital"
                className="w-full rounded-3xl object-cover shadow-2xl aspect-[3/4] object-top relative"
              />
              <div className="absolute bottom-4 left-4 right-4 rounded-2xl p-4" style={{background:'rgba(10,14,26,0.9)', backdropFilter:'blur(10px)', border:'1px solid rgba(245,200,66,0.2)'}}>
                <div className="font-bold text-white text-lg" style={{fontFamily:"'Barlow Condensed', sans-serif"}}>CODY TYLER McCAIN</div>
                <div className="text-sm" style={{color:'#f5c842'}}>Founder & CEO, Conscious Capital</div>
                <div className="text-xs text-gray-500 mt-0.5">Atlanta, Georgia</div>
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold mb-5 border" style={{background:'rgba(245,200,66,0.08)', borderColor:'rgba(245,200,66,0.2)', color:'#f5c842'}}>
                <Star className="w-3 h-3" />
                FOUNDER'S STORY
              </div>
              <h3 className="text-3xl lg:text-4xl font-black text-white mb-5" style={{fontFamily:"'Barlow Condensed', sans-serif"}}>
                I BUILT THE TOOL I WISH I HAD IN THE FIELD.
              </h3>
              <p className="text-gray-400 leading-relaxed mb-4">
                After years working in roofing insurance sales across the Southeast, I watched contractor after contractor leave $3,000–$15,000 per job on the table — not because they didn't deserve it, but because they didn't have the time or the tools to fight for every line item.
              </p>
              <p className="text-gray-400 leading-relaxed mb-6">
                Supplement specialists were taking 30–50% cuts. Adjusters were banking on contractors not knowing the codes. I decided to change that. This is revolutionary — a game changer no matter who you are. And you're seeing it early.
              </p>
              <div className="flex flex-col gap-3">
                {["Years in roofing insurance sales", "Built for contractors, by a contractor", "Still on roofs — this is real world tested"].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm text-gray-300">
                    <CheckCircle className="w-4 h-4 shrink-0" style={{color:'#f5c842'}} />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative overflow-hidden" style={{background:'linear-gradient(135deg, #0a0e1a 0%, #141e3a 100%)'}}>
        <div className="absolute inset-0 opacity-20">
          <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663360996271/3ZX44EBEWux9xrkumJtpAc/ad_contractor_vertical_e17467c6.png" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0" style={{background:'linear-gradient(135deg, rgba(10,14,26,0.85) 0%, rgba(20,30,58,0.85) 100%)'}} />
        <div className="container relative text-center">
          <h2 className="text-5xl lg:text-7xl font-black text-white mb-4" style={{fontFamily:"'Barlow Condensed', sans-serif"}}>
            START RECOVERING
            <span className="block" style={{color:'#f5c842'}}>EVERY DOLLAR.</span>
          </h2>
          <p className="text-gray-300 mb-8 max-w-lg mx-auto text-lg">
            Join roofing contractors using AI to find every supplement dollar they're owed. You're seeing it early.
          </p>
          <Button size="lg" className="btn-gold text-lg px-12 py-6" onClick={handleCTA}>
            Get Started Free
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="mt-4 text-sm text-gray-500">No credit card required. Free to start.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8" style={{background:'#070a12', borderTop:'1px solid rgba(255,255,255,0.06)'}}>
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663360996271/3ZX44EBEWux9xrkumJtpAc/cc_logo_transparent_0cf366e7.png" alt="Conscious Claims" className="w-8 h-8 object-contain" />
            <span className="font-bold text-white" style={{fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.05em'}}>CONSCIOUS CLAIMS</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => navigate("/pricing")} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Pricing</button>
            <button onClick={() => navigate("/free-guide")} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Free Guide</button>
            <button onClick={() => navigate("/affiliates")} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Affiliates</button>
            <button onClick={() => window.location.href = getLoginUrl()} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Sign In</button>
          </div>
          <p className="text-sm text-gray-600">© {new Date().getFullYear()} Conscious Claims by Conscious Capital.</p>
        </div>
      </footer>
    </div>
    </>
  );
}
