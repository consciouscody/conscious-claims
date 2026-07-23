import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CheckCircle, Users, Zap, Shield, TrendingUp } from "lucide-react";
import { Link } from "wouter";

export default function Waitlist() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { data: countData } = trpc.waitlist.getCount.useQuery();
  const signupMutation = trpc.waitlist.signup.useMutation({
    onSuccess: (data) => {
      if (data.alreadySignedUp) {
        toast.info("You're already on the list! We'll be in touch.");
      } else {
        setSubmitted(true);
      }
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    signupMutation.mutate({ email: email.trim(), name: name.trim() || undefined, company: company.trim() || undefined });
  };

  const signupCount = (countData?.count ?? 0) + 47; // seed number for social proof

  const FEATURES = [
    {
      icon: Zap,
      title: "AI Supplement Detection",
      desc: "Upload any Xactimate estimate. Get every missing line item in seconds.",
    },
    {
      icon: Shield,
      title: "Adjuster-Ready Emails",
      desc: "AI-drafted rebuttal emails with code references that adjusters can't ignore.",
    },
    {
      icon: TrendingUp,
      title: "CRM Integration",
      desc: "Connects to JobNimbus, AccuLynx, Roofr, and any CRM via Zapier.",
    },
    {
      icon: Users,
      title: "LinkedIn Post Generator",
      desc: "McConaughey-style posts that build your brand while you're on the roof.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-[#c9a84c] flex items-center justify-center font-bold text-[#0a0f1e] text-sm">
              CC
            </div>
            <span className="font-bold text-white">Conscious Claims</span>
          </div>
        </Link>
        <Link href="/pricing">
          <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:text-white bg-transparent">
            View Pricing
          </Button>
        </Link>
      </nav>

      {/* Hero */}
      <div className="max-w-2xl mx-auto px-6 pt-20 pb-12 text-center">
        {/* Social proof badge */}
        <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 text-sm text-orange-400 mb-8">
          <Users className="w-3.5 h-3.5" />
          <span>{signupCount} roofing contractors already on the list</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6">
          Stop leaving{" "}
          <span className="text-orange-400">$10,000–$50,000</span>
          <br />
          on the table every year.
        </h1>

        <p className="text-lg text-gray-400 mb-4 leading-relaxed">
          Conscious Claims finds every Xactimate line item your adjuster skipped — then writes the email to get it approved.
          Built by a roofing contractor, for roofing contractors.
        </p>

        <p className="text-sm text-gray-500 mb-10">
          Join the waitlist. Get early access + 30 days free when we launch your region.
        </p>

        {/* Form */}
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-3 max-w-md mx-auto">
            <Input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 h-12 text-base"
            />
            <Input
              type="text"
              placeholder="Company name (optional)"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 h-12 text-base"
            />
            <Input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 h-12 text-base"
            />
            <Button
              type="submit"
              disabled={signupMutation.isPending || !email.trim()}
              className="w-full h-12 text-base font-bold bg-[#c9a84c] hover:bg-[#b8963e] text-[#0a0f1e] font-bold"
            >
              {signupMutation.isPending ? "Joining..." : "Join the Waitlist — It's Free"}
            </Button>
            <p className="text-xs text-gray-600">No spam. No credit card. Just early access.</p>
          </form>
        ) : (
          <div className="max-w-md mx-auto bg-gray-900 border border-green-500/30 rounded-2xl p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">You're on the list.</h2>
            <p className="text-gray-400 text-sm mb-4">
              We'll hit you first when we open your region. In the meantime — download the free playbook.
            </p>
            <Link href="/free-guide">
              <Button className="bg-[#c9a84c] hover:bg-[#b8963e] text-[#0a0f1e] font-bold">
                Get the Free Supplement Playbook
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Features */}
      <div className="max-w-3xl mx-auto px-6 pb-20">
        <p className="text-center text-sm text-gray-500 mb-8 uppercase tracking-widest">What you're getting access to</p>
        <div className="grid md:grid-cols-2 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                <f.icon className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm mb-1">{f.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-800 px-6 py-6 text-center text-xs text-gray-600">
        © {new Date().getFullYear()} Conscious Claims · conscioussupplements.com
      </div>
    </div>
  );
}
