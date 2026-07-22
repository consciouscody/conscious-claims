import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getStoredReferralCode } from "@/hooks/useReferralTracking";

const COVER_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663360996271/3ZX44EBEWux9xrkumJtpAc/storm-the-door-cover-CskytMqCxhErx4i5UwBFEC.webp";

export default function StormTheDoor() {
  const [loading, setLoading] = useState(false);

  const checkout = trpc.stripe.createEbookCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.info("Redirecting to secure checkout...");
        window.open(data.url, "_blank");
      }
      setLoading(false);
    },
    onError: (err) => {
      toast.error(err.message || "Checkout failed. Please try again.");
      setLoading(false);
    },
  });

  const handleBuy = () => {
    setLoading(true);
    const referralCode = getStoredReferralCode();
    checkout.mutate({
      origin: window.location.origin,
      ebookId: "storm_the_door",
      referralCode: referralCode || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-[#0d1b2a] text-white">
      {/* Nav */}
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <Link href="/">
          <span className="font-bold text-xl tracking-tight cursor-pointer">
            <span className="text-[#FF6B00]">CC</span> Conscious Capital
          </span>
        </Link>
        <Link href="/">
          <Button variant="ghost" className="text-white/70 hover:text-white text-sm">
            ← Back to Conscious Claims
          </Button>
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-16 items-center">
        {/* Cover */}
        <div className="relative">
          <div className="absolute -inset-4 bg-[#FF6B00]/20 rounded-2xl blur-2xl" />
          <img
            src={COVER_URL}
            alt="Storm the Door Cover"
            className="relative rounded-xl shadow-2xl w-full max-w-sm mx-auto"
          />
        </div>

        {/* Copy */}
        <div>
          <Badge className="bg-[#FF6B00]/20 text-[#FF6B00] border-[#FF6B00]/30 mb-4">
            Conscious Capital Playbook Series
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black leading-tight mb-4">
            Storm the Door
          </h1>
          <p className="text-xl text-white/70 mb-2 font-medium">
            A Roofing Contractor's Psychological Sales Playbook
          </p>
          <p className="text-white/50 italic mb-8">My Proven Methods</p>

          <div className="space-y-3 mb-8">
            {[
              "The Mirror Effect — build trust in 60 seconds",
              "The Master Frame — stop selling roofing, start managing risk",
              "The Door Approach — the exact first 30 seconds",
              "The Post-Inspection Close — word-for-word script",
              "10 Objections — and how to lower every shield",
              "10 Advanced Psychological Principles",
              "Bonus: 10 AI Prompts for roofing contractors",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="text-[#FF6B00] mt-0.5 text-lg">✓</span>
                <span className="text-white/80 text-sm">{item}</span>
              </div>
            ))}
          </div>

          {/* Price + CTA */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-4xl font-black text-white">$27</span>
              <span className="text-white/40 line-through text-lg">$97</span>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">72% OFF</Badge>
            </div>
            <p className="text-white/50 text-sm mb-5">One-time payment. Instant PDF download.</p>
            <Button
              onClick={handleBuy}
              disabled={loading || checkout.isPending}
              className="w-full bg-[#c9a84c] hover:bg-[#b8963e] text-[#0a0f1e] font-bold font-bold text-lg py-6 rounded-xl"
            >
              {loading || checkout.isPending ? "Loading..." : "Get Instant Access — $27"}
            </Button>
            <p className="text-white/30 text-xs text-center mt-3">
              Secure checkout via Stripe · Instant download after payment
            </p>
          </div>

          <blockquote className="border-l-4 border-[#FF6B00] pl-4 text-white/60 italic text-sm">
            "Objections are rarely logical. They're emotional shields. You don't overpower shields. You lower them."
          </blockquote>
        </div>
      </section>

      {/* What's Inside */}
      <section className="bg-white/5 border-y border-white/10 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-black text-center mb-12">
            What's Inside the <span className="text-[#FF6B00]">Playbook</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                num: "01",
                title: "Frame Control & State Control",
                desc: "The two forces that determine whether you close or get shut out — before you knock a single door.",
              },
              {
                num: "02",
                title: "The Master Frame",
                desc: "Stop being a roofer. Become a risk advisor, asset protector, and claim specialist. That reframe changes everything.",
              },
              {
                num: "03",
                title: "The Mirror Effect",
                desc: "Match their energy, speech pace, and posture. FBI negotiators use this. Therapists use this. Now you will too.",
              },
              {
                num: "04",
                title: "The Door Approach",
                desc: "Social proof, the assumptive move, and the double-bind question — the exact sequence for the first 30 seconds.",
              },
              {
                num: "05",
                title: "The Post-Inspection Close",
                desc: "Word-for-word script for when you come down off the roof. Position yourself as their attorney, not their contractor.",
              },
              {
                num: "06",
                title: "10 Objections — Fully Scripted",
                desc: "Every objection from 'I'm not interested' to 'I'll think about it' — with the exact language to lower the shield.",
              },
              {
                num: "07",
                title: "10 Psychological Principles",
                desc: "Micro-commitment ladder, walk-away power, identity alignment, scarcity without hype — the advanced framework.",
              },
              {
                num: "08",
                title: "Bonus: 10 AI Prompts",
                desc: "Copy-paste prompts for door hangers, follow-up texts, adjuster emails, Facebook posts, and more.",
              },
            ].map((item) => (
              <div key={item.num} className="bg-white/5 border border-white/10 rounded-xl p-5">
                <div className="text-[#FF6B00] font-black text-2xl mb-2">{item.num}</div>
                <h3 className="font-bold text-white mb-1">{item.title}</h3>
                <p className="text-white/50 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Conscious Claims Cross-sell */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="bg-gradient-to-br from-[#FF6B00]/20 to-[#FF6B00]/5 border border-[#FF6B00]/30 rounded-2xl p-10">
          <h2 className="text-2xl font-black mb-3">
            Already have the sales system?
          </h2>
          <p className="text-white/60 mb-6 max-w-xl mx-auto">
            Conscious Claims handles the other half — analyzing your Xactimate estimate, finding every missing line item, and generating a professional adjuster email in under 5 minutes.
          </p>
          <Link href="/">
            <Button className="bg-white text-[#0d1b2a] hover:bg-white/90 font-bold px-8 py-3">
              Try Conscious Claims Free →
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-white/30 text-sm">
        © {new Date().getFullYear()} Conscious Capital. All rights reserved.
      </footer>
    </div>
  );
}
