import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Link } from "wouter";

const EBOOK_COVER =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663360996271/3ZX44EBEWux9xrkumJtpAc/roofing_psychology_cover_ad084dce.png";

const LINE_ITEMS = [
  { code: "CH. 1", label: "Frame Control & State Control", value: "Own every conversation" },
  { code: "CH. 2", label: "The Master Frame", value: "You are not selling roofing" },
  { code: "CH. 3", label: "The Mirror Effect", value: "Build trust in 60 seconds" },
  { code: "CH. 4", label: "The Door Approach", value: "The first 30 seconds" },
  { code: "CH. 5", label: "The Post-Inspection Close", value: "Coming down off the roof" },
  { code: "CH. 6", label: "10 Objections — Fully Scripted", value: "Word-for-word responses" },
];

export default function FreeGuide() {
  const [form, setForm] = useState({ name: "", email: "", company: "", phone: "" });
  const [submitted, setSubmitted] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");

  const submitLead = trpc.leads.submitEbookLead.useMutation({
    onSuccess: (data) => {
      setSubmitted(true);
      setDownloadUrl(data.downloadUrl);
      // Auto-trigger download
      const a = document.createElement("a");
      a.href = data.downloadUrl;
      a.download = "Roofing_Psychology_at_the_Door.pdf";
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },
    onError: (err) => {
      toast.error("Something went wrong: " + err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    submitLead.mutate({ ...form, source: "free-guide-page" });
  };

  return (
    <div className="min-h-screen bg-[#0a1628] text-white">
      {/* Nav */}
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <Link href="/">
          <span className="text-xl font-black text-white cursor-pointer">
            Supplement<span className="text-orange-500">AI</span>
          </span>
        </Link>
        <Link href="/">
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 text-sm">
            ← Back to Home
          </Button>
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — copy */}
          <div>
            <div className="inline-flex items-center gap-2 bg-orange-500/15 border border-orange-500/30 rounded-full px-4 py-1.5 text-orange-400 text-sm font-semibold mb-6">
              FREE DOWNLOAD — No Credit Card Required
            </div>
            <h1 className="text-4xl lg:text-5xl font-black leading-tight mb-6">
              Roofing Psychology{" "}
              <span className="text-orange-500">at the Door</span>
            </h1>
            <p className="text-xl text-white/70 leading-relaxed mb-8">
              The proven door-knocking playbook for roofing contractors — frame control, mirror effect,
              post-inspection close, and 10 fully-scripted objection responses. Free.
            </p>

            {/* Value bullets */}
            <div className="space-y-3 mb-10">
              {[
                "Frame control & state control — own every conversation",
                "The Mirror Effect — build trust in 60 seconds",
                "10 objections fully scripted — word for word",
                "10 psychological principles every closer must know",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-white/80 text-sm">{item}</span>
                </div>
              ))}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
              {[
                { value: "10", label: "Objections scripted" },
                { value: "10", label: "Psych principles" },
                { value: "8", label: "Chapters of field-tested content" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-black text-orange-500">{stat.value}</div>
                  <div className="text-xs text-white/50 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — form + cover */}
          <div>
            {!submitted ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                <div className="flex gap-6 items-start mb-8">
                  <img
                    src={EBOOK_COVER}
                    alt="Roofing Psychology at the Door Cover"
                    className="w-28 rounded-lg shadow-2xl flex-shrink-0"
                  />
                  <div>
                    <h2 className="text-lg font-bold text-white mb-1">
                      Get Your Free Copy
                    </h2>
                    <p className="text-white/60 text-sm leading-relaxed">
                      Enter your info below and the PDF downloads instantly. No spam, no catch.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-white/70 text-sm mb-1.5 block">
                      Your Name <span className="text-orange-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="John Smith"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-white/70 text-sm mb-1.5 block">
                      Email Address <span className="text-orange-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@roofingco.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-orange-500"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="company" className="text-white/70 text-sm mb-1.5 block">
                        Company Name
                      </Label>
                      <Input
                        id="company"
                        placeholder="ABC Roofing"
                        value={form.company}
                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-white/70 text-sm mb-1.5 block">
                        Phone (optional)
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(555) 000-0000"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={submitLead.isPending}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-base py-6 rounded-xl mt-2"
                  >
                    {submitLead.isPending ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Preparing your download...
                      </span>
                    ) : (
                      "Send Me the Free Playbook →"
                    )}
                  </Button>
                  <p className="text-center text-white/30 text-xs">
                    No spam. Unsubscribe anytime. Your info is never sold.
                  </p>
                </form>
              </div>
            ) : (
              /* Success state */
              <div className="bg-white/5 border border-orange-500/30 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-black text-white mb-3">Your psychology playbook is downloading!</h2>
                <p className="text-white/60 mb-6 leading-relaxed">
                  If the download didn't start automatically, click the button below. Check your inbox — we'll
                  also send you a link.
                </p>
                <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 text-base rounded-xl mb-4">
                    Download PDF Now →
                  </Button>
                </a>
                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-white/50 text-sm mb-3">
                    Ready to find these items automatically on every job?
                  </p>
                  <Link href="/">
                    <Button variant="outline" className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10">
                      Try Conscious Claims Free →
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* What's Inside */}
      <section className="border-t border-white/10 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white mb-3">
              What's Inside the Playbook
            </h2>
            <p className="text-white/50">8 chapters of proven door-knocking psychology — tested at real doors, against real objections</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {LINE_ITEMS.map((item) => (
              <div
                key={item.code}
                className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-orange-500/30 transition-colors"
              >
                <div className="inline-block bg-orange-500/20 text-orange-400 font-mono text-xs font-bold px-2 py-1 rounded mb-3">
                  {item.code}
                </div>
                <div className="font-semibold text-white text-sm mb-2">{item.label}</div>
                <div className="text-orange-400 text-xs">{item.value}</div>
              </div>
            ))}
          </div>
          <p className="text-center text-white/30 text-sm mt-6">
            + Bonus chapter: 10 AI prompts to sharpen your game before every session
          </p>
        </div>
      </section>

      {/* Author */}
      <section className="border-t border-white/10 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-white/40 text-sm font-semibold uppercase tracking-widest mb-4">About the Author</p>
          <h3 className="text-2xl font-black text-white mb-2">Cody Tyler McCain</h3>
          <p className="text-orange-500 text-sm mb-6">Founder, Conscious Claims &amp; Conscious Claims — Atlanta, Georgia</p>
          <p className="text-white/60 leading-relaxed">
            Cody spent years in roofing insurance sales across the Southeast before building the tool he wished he'd
            had in the field. After watching contractor after contractor leave $3,000–$15,000 per job on the table,
            he built Conscious Claims to change that.
          </p>
          <blockquote className="mt-8 text-xl font-bold text-white/80 italic border-l-4 border-orange-500 pl-5 text-left">
            "Stop splitting your supplements. Own every outcome."
          </blockquote>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-white/10 py-16 bg-gradient-to-b from-transparent to-orange-950/20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-black text-white mb-4">
            You Have the Psychology.<br />
            <span className="text-orange-500">Now Let AI Handle the Supplements.</span>
          </h2>
          <p className="text-white/60 mb-8 leading-relaxed">
            Conscious Claims uploads your Xactimate PDF, identifies every missing line item, generates the supplement
            request, and drafts the adjuster email — in under 5 minutes.
          </p>
          <Link href="/">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-10 py-6 text-lg rounded-xl">
              Try Conscious Claims Free →
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-white/30 text-sm">
        © 2026 Conscious Claims. All rights reserved.
      </footer>
    </div>
  );
}
