import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Link } from "wouter";

interface AuditCategory {
  score: number;
  status: string;
  issues: string[];
  quickWin: string;
}

interface AuditResult {
  overallScore: number;
  summary: string;
  estimatedMissedLeadsPerMonth: number;
  estimatedRevenueLostPerYear: number;
  categories: {
    googleBusinessProfile: AuditCategory;
    websiteAEO: AuditCategory;
    aiSearchPresence: AuditCategory;
    reviewsAndReputation: AuditCategory;
    localCitations: AuditCategory;
  };
  topThreeActions: { priority: number; action: string; impact: string; timeToImplement: string }[];
  chatGPTTestResult: string;
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 70 ? "#2ECC71" : score >= 40 ? "#F39C12" : "#E74C3C";
  const label = score >= 70 ? "Good" : score >= 40 ? "Needs Work" : "Critical";
  return (
    <div className="flex flex-col items-center">
      <div
        className="w-28 h-28 rounded-full flex flex-col items-center justify-center border-4"
        style={{ borderColor: color }}
      >
        <span className="text-3xl font-black" style={{ color }}>{score}</span>
        <span className="text-xs font-semibold" style={{ color }}>{label}</span>
      </div>
    </div>
  );
}

function CategoryBar({ name, data }: { name: string; data: AuditCategory }) {
  const color = data.score >= 70 ? "bg-green-500" : data.score >= 40 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-semibold text-white">{name}</span>
        <span className="text-sm font-bold text-gray-300">{data.score}/100</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${data.score}%` }} />
      </div>
      <p className="text-xs text-gray-400 italic">{data.status}</p>
      {data.quickWin && (
        <p className="text-xs text-yellow-400 mt-1">⚡ Quick win: {data.quickWin}</p>
      )}
    </div>
  );
}

export default function VisibilityAudit() {
  const [form, setForm] = useState({ businessName: "", city: "", website: "", email: "" });
  const [result, setResult] = useState<AuditResult | null>(null);

  const runAudit = trpc.visibility.runAudit.useMutation({
    onSuccess: (data) => {
      setResult(data.auditResult as AuditResult);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.businessName || !form.city) {
      toast.error("Please enter your business name and city.");
      return;
    }
    runAudit.mutate(form);
  };

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      {/* Nav */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <Link href="/">
          <span className="text-xl font-black text-yellow-400 tracking-tight cursor-pointer">CONSCIOUS CAPITAL</span>
        </Link>
        <Link href="/waitlist">
          <Button size="sm" className="bg-yellow-400 text-black hover:bg-yellow-300 font-bold">Join Waitlist</Button>
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        {!result ? (
          <>
            {/* Hero */}
            <div className="text-center mb-12">
              <div className="inline-block bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-widest">
                Free Tool
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
                Is Your Business <span className="text-yellow-400">Invisible</span> to AI?
              </h1>
              <p className="text-gray-400 text-lg max-w-xl mx-auto">
                45% of customers now use ChatGPT and Perplexity to find contractors. Only 1.2% of businesses get recommended. Find out where you stand — free, in 30 seconds.
              </p>
            </div>

            {/* Form */}
            <div className="bg-[#0F2A4A] border border-gray-700 rounded-2xl p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <Label className="text-gray-300 mb-1 block">Business Name *</Label>
                    <Input
                      placeholder="e.g. Smith Roofing LLC"
                      value={form.businessName}
                      onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                      className="bg-gray-800 border-gray-600 text-white placeholder-gray-500"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300 mb-1 block">City & State *</Label>
                    <Input
                      placeholder="e.g. Dallas, TX"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="bg-gray-800 border-gray-600 text-white placeholder-gray-500"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300 mb-1 block">Website (optional)</Label>
                  <Input
                    placeholder="e.g. smithroofing.com"
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-500"
                  />
                </div>
                <div>
                  <Label className="text-gray-300 mb-1 block">Email (optional — we'll send you the report)</Label>
                  <Input
                    type="email"
                    placeholder="you@yourcompany.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-500"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={runAudit.isPending}
                  className="w-full bg-yellow-400 text-black hover:bg-yellow-300 font-black text-lg py-6"
                >
                  {runAudit.isPending ? "Analyzing your AI visibility..." : "Run My Free Audit →"}
                </Button>
              </form>
              {runAudit.isPending && (
                <div className="mt-6 text-center">
                  <div className="inline-flex items-center gap-3 text-gray-400 text-sm">
                    <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                    Checking ChatGPT, Google AI, Perplexity, and your local presence...
                  </div>
                </div>
              )}
            </div>

            {/* Social proof */}
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              {[
                ["45%", "of consumers use AI to find services"],
                ["1.2%", "of businesses get AI-recommended"],
                ["$0", "cost to run this audit"],
              ].map(([num, label]) => (
                <div key={num} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                  <div className="text-2xl font-black text-yellow-400">{num}</div>
                  <div className="text-xs text-gray-400 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Results */}
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black mb-2">Your AI Visibility Report</h2>
              <p className="text-gray-400">{form.businessName} · {form.city}</p>
            </div>

            {/* Overall score */}
            <div className="bg-[#0F2A4A] border border-gray-700 rounded-2xl p-8 mb-6 flex flex-col md:flex-row items-center gap-8">
              <ScoreRing score={result.overallScore} />
              <div className="flex-1">
                <p className="text-gray-300 mb-4">{result.summary}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-red-900/30 border border-red-700 rounded-xl p-3 text-center">
                    <div className="text-2xl font-black text-red-400">{result.estimatedMissedLeadsPerMonth}</div>
                    <div className="text-xs text-gray-400">leads missed/month</div>
                  </div>
                  <div className="bg-red-900/30 border border-red-700 rounded-xl p-3 text-center">
                    <div className="text-2xl font-black text-red-400">${result.estimatedRevenueLostPerYear.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">revenue lost/year</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ChatGPT test */}
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 mb-6">
              <p className="text-xs text-yellow-400 font-bold uppercase tracking-widest mb-2">What ChatGPT says about you right now</p>
              <p className="text-gray-300 text-sm italic">"{result.chatGPTTestResult}"</p>
            </div>

            {/* Category scores */}
            <div className="bg-[#0F2A4A] border border-gray-700 rounded-2xl p-8 mb-6">
              <h3 className="text-lg font-bold mb-6">Category Breakdown</h3>
              <CategoryBar name="Google Business Profile" data={result.categories.googleBusinessProfile} />
              <CategoryBar name="Website AEO (AI Readability)" data={result.categories.websiteAEO} />
              <CategoryBar name="AI Search Presence" data={result.categories.aiSearchPresence} />
              <CategoryBar name="Reviews & Reputation" data={result.categories.reviewsAndReputation} />
              <CategoryBar name="Local Citations" data={result.categories.localCitations} />
            </div>

            {/* Top 3 actions */}
            <div className="bg-[#0F2A4A] border border-gray-700 rounded-2xl p-8 mb-8">
              <h3 className="text-lg font-bold mb-6">Your Top 3 Priority Actions</h3>
              <div className="space-y-4">
                {result.topThreeActions.map((action) => (
                  <div key={action.priority} className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-yellow-400 text-black flex items-center justify-center font-black text-sm flex-shrink-0">
                      {action.priority}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{action.action}</p>
                      <p className="text-sm text-gray-400">{action.impact}</p>
                      <p className="text-xs text-yellow-400 mt-1">⏱ {action.timeToImplement}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-yellow-400 rounded-2xl p-8 text-center text-black">
              <h3 className="text-2xl font-black mb-2">Want Us to Fix All of This for You?</h3>
              <p className="mb-6 font-medium">Conscious Capital handles everything — AEO, website, automations, and supplements. You focus on the work, we handle the growth.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/waitlist">
                  <Button className="bg-black text-white hover:bg-gray-900 font-bold px-8">Join the Waitlist →</Button>
                </Link>
                <Button
                  variant="outline"
                  className="border-black text-black hover:bg-black/10 font-bold px-8"
                  onClick={() => { setResult(null); setForm({ businessName: "", city: "", website: "", email: "" }); }}
                >
                  Run Another Audit
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
