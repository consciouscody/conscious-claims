import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  MousePointer,
  ShoppingCart,
  TrendingUp,
  Copy,
  CheckCircle,
  ExternalLink,
  Clock,
  ArrowRight,
  Share2,
} from "lucide-react";

function StatCard({
  title,
  value,
  sub,
  icon,
  color,
}: {
  title: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-400 text-sm">{title}</span>
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
            {icon}
          </div>
        </div>
        <div className="text-3xl font-black text-white">{value}</div>
        {sub && <div className="text-gray-500 text-xs mt-1">{sub}</div>}
      </CardContent>
    </Card>
  );
}

export default function AffiliateDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [copied, setCopied] = useState(false);

  const { data: stats, isLoading } = trpc.affiliate.myStats.useQuery(undefined, {
    enabled: !!user,
  });

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Share2 className="w-8 h-8 text-orange-400" />
          </div>
          <h1 className="text-2xl font-bold mb-3">Affiliate Dashboard</h1>
          <p className="text-gray-400 mb-6">
            Sign in to view your affiliate stats, referral link, and earnings.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/affiliates">
              <Button variant="outline" className="border-gray-700 text-gray-300">
                Learn More
              </Button>
            </Link>
            <Button
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => {
                window.location.href = "/api/oauth/login?returnPath=/affiliate-dashboard";
              }}
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-gray-500" />
          </div>
          <h1 className="text-2xl font-bold mb-3">Not Yet an Affiliate</h1>
          <p className="text-gray-400 mb-6">
            You're signed in as <span className="text-white">{user.email}</span>, but this email
            isn't registered as an affiliate yet. Apply below to get your referral link.
          </p>
          <Link href="/affiliates">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              Apply to Be an Affiliate <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const { affiliate, conversions, referralLink } = stats;
  const pendingBalance =
    parseFloat(affiliate.totalEarned ?? "0") - parseFloat(affiliate.totalPaid ?? "0");

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/">
            <span className="text-xl font-bold text-orange-400 cursor-pointer">SupplementAI</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm">{user.name || user.email}</span>
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="border-gray-700 text-gray-300">
                App Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white">Affiliate Dashboard</h1>
            <p className="text-gray-400 mt-1">
              Welcome back, {affiliate.name}.{" "}
              <Badge
                className={
                  affiliate.status === "active"
                    ? "bg-green-500/20 text-green-400 border-green-500/30"
                    : affiliate.status === "pending"
                    ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                    : "bg-red-500/20 text-red-400 border-red-500/30"
                }
              >
                {affiliate.status === "active"
                  ? "Active"
                  : affiliate.status === "pending"
                  ? "Pending Review"
                  : "Suspended"}
              </Badge>
            </p>
          </div>
        </div>

        {/* Pending status notice */}
        {affiliate.status === "pending" && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-8 flex items-start gap-3">
            <Clock className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-yellow-300 font-semibold">Application Under Review</p>
              <p className="text-yellow-400/70 text-sm">
                Your affiliate account is being reviewed. We'll activate it within 24 hours.
                Your referral code is <strong>{affiliate.referralCode}</strong> — it will start
                tracking once approved.
              </p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Earned"
            value={`$${parseFloat(affiliate.totalEarned ?? "0").toFixed(2)}`}
            sub="All time"
            icon={<DollarSign className="w-4 h-4" />}
            color="bg-green-500/20 text-green-400"
          />
          <StatCard
            title="Pending Payout"
            value={`$${pendingBalance.toFixed(2)}`}
            sub="Paid out next 1st"
            icon={<TrendingUp className="w-4 h-4" />}
            color="bg-orange-500/20 text-orange-400"
          />
          <StatCard
            title="Total Clicks"
            value={(affiliate.totalClicks ?? 0).toString()}
            sub="Referral link clicks"
            icon={<MousePointer className="w-4 h-4" />}
            color="bg-blue-500/20 text-blue-400"
          />
          <StatCard
            title="Conversions"
            value={(affiliate.totalConversions ?? 0).toString()}
            sub="Sales attributed"
            icon={<ShoppingCart className="w-4 h-4" />}
            color="bg-purple-500/20 text-purple-400"
          />
        </div>

        {/* Referral Link */}
        <Card className="bg-gray-900 border-gray-800 mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg">Your Referral Link</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-300 text-sm font-mono truncate">
                {referralLink}
              </div>
              <Button
                onClick={() => copyLink(referralLink)}
                className={
                  copied
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-orange-500 hover:bg-orange-600 text-white"
                }
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" /> Copy
                  </>
                )}
              </Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-gray-500 text-xs">Share to:</span>
              {[
                { label: "Facebook", url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}` },
                { label: "Twitter/X", url: `https://twitter.com/intent/tweet?text=Check+out+SupplementAI+for+roofing+contractors&url=${encodeURIComponent(referralLink)}` },
                { label: "LinkedIn", url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}` },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-orange-400 hover:text-orange-300 underline"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Commission Breakdown */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[
            { product: "Storm the Door Book", price: "$27", earn: "$10.80", type: "One-time" },
            { product: "SupplementAI Pro Monthly", price: "$97/mo", earn: "$38.80/mo", type: "Recurring" },
            { product: "SupplementAI Pro Annual", price: "$970/yr", earn: "$388/yr", type: "Recurring" },
          ].map((item) => (
            <Card key={item.product} className="bg-gray-900 border-gray-800">
              <CardContent className="p-4">
                <Badge className="bg-gray-800 text-gray-400 border-gray-700 text-xs mb-2">
                  {item.type}
                </Badge>
                <p className="text-white text-sm font-semibold mb-1">{item.product}</p>
                <p className="text-gray-500 text-xs">
                  Sale: {item.price} → You earn:{" "}
                  <span className="text-green-400 font-bold">{item.earn}</span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Conversions */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg">Recent Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            {conversions.length === 0 ? (
              <div className="text-center py-10">
                <ShoppingCart className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500">No conversions yet.</p>
                <p className="text-gray-600 text-sm mt-1">
                  Share your referral link to start earning!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {conversions.map((conv) => (
                  <div
                    key={conv.id}
                    className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0"
                  >
                    <div>
                      <p className="text-white text-sm font-semibold">{conv.productName}</p>
                      <p className="text-gray-500 text-xs">
                        {new Date(conv.createdAt).toLocaleDateString()}
                        {" · "}
                        <Badge
                          className={
                            conv.payoutStatus === "paid"
                              ? "bg-green-500/20 text-green-400 border-green-500/30 text-xs"
                              : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs"
                          }
                        >
                          {conv.payoutStatus}
                        </Badge>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-bold">
                        +${parseFloat(conv.commissionAmount).toFixed(2)}
                      </p>
                      <p className="text-gray-600 text-xs">
                        Sale: ${parseFloat(conv.saleAmount).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Marketing Resources */}
        <Card className="bg-gray-900 border-gray-800 mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg">Marketing Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  title: "Facebook Post Copy",
                  desc: "4 ready-to-post captions for Facebook and Instagram",
                  action: "Copy Templates",
                  content:
                    "🔨 Roofing contractors — stop leaving money on the table!\n\nSupplementAI scans your Xactimate estimates and finds every missing line item in seconds. Upload your estimate, get a complete supplement list, and send a professional email to the adjuster — all in one tool.\n\nTry it free: " + referralLink,
                },
                {
                  title: "Email Swipe",
                  desc: "Email template to send to your roofing contacts",
                  action: "Copy Email",
                  content:
                    `Subject: Tool that recovers thousands on every roof claim\n\nHey [Name],\n\nI wanted to share something that's been a game-changer for roofing contractors doing insurance work.\n\nSupplementAI analyzes your Xactimate estimates and automatically finds missing line items — things like O&P, code upgrades, and materials adjusters routinely leave out. It then generates a professional email to send to the adjuster.\n\nContractors are recovering $2,000-$8,000 more per claim.\n\nCheck it out: ${referralLink}\n\n[Your Name]`,
                },
                {
                  title: "SMS/Text Script",
                  desc: "Short text message to send to contractor contacts",
                  action: "Copy Text",
                  content:
                    `Hey! Quick question — are you leaving money on your roof claims? This AI tool finds missing line items in Xactimate estimates automatically. Worth checking out: ${referralLink}`,
                },
              ].map((resource) => (
                <div key={resource.title} className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-1">{resource.title}</h3>
                  <p className="text-gray-400 text-xs mb-3">{resource.desc}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:text-white w-full"
                    onClick={() => {
                      navigator.clipboard.writeText(resource.content);
                      alert("Copied to clipboard!");
                    }}
                  >
                    <Copy className="w-3 h-3 mr-2" />
                    {resource.action}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
