import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  Users,
  TrendingUp,
  Share2,
  CheckCircle,
  ArrowRight,
  Star,
  Zap,
  BarChart3,
  Gift,
} from "lucide-react";

export default function Affiliates() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    paypalEmail: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submitMutation = trpc.affiliate.submitApplication.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setSubmitted(true);
        setReferralCode(data.referralCode);
      } else {
        setError(data.message);
      }
    },
    onError: (err) => {
      setError(err.message || "Something went wrong. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name || !form.email) {
      setError("Name and email are required.");
      return;
    }
    submitMutation.mutate({
      name: form.name,
      email: form.email,
      phone: form.phone || undefined,
      company: form.company || undefined,
      paypalEmail: form.paypalEmail || undefined,
      message: form.message || undefined,
    });
  };

  const commissions = [
    {
      product: "Storm the Door E-Book",
      price: "$27",
      commission: "$10.80",
      type: "One-time",
      color: "text-orange-400",
    },
    {
      product: "Conscious Claims Pro Monthly",
      price: "$97/mo",
      commission: "$38.80/mo",
      type: "Recurring",
      color: "text-green-400",
    },
    {
      product: "Conscious Claims Pro Annual",
      price: "$970/yr",
      commission: "$388/yr",
      type: "Recurring",
      color: "text-blue-400",
    },
  ];

  const steps = [
    {
      step: "1",
      title: "Apply Below",
      desc: "Fill out the short form. We review and activate within 24 hours.",
      icon: <Users className="w-6 h-6" />,
    },
    {
      step: "2",
      title: "Get Your Link",
      desc: "You'll receive a unique referral link like: consconscioussupplements.com/?ref=YOURCODE",
      icon: <Share2 className="w-6 h-6" />,
    },
    {
      step: "3",
      title: "Share & Earn",
      desc: "Post on social, text your network, or run ads. Every sale earns 40% commission.",
      icon: <TrendingUp className="w-6 h-6" />,
    },
    {
      step: "4",
      title: "Get Paid",
      desc: "Commissions paid monthly via PayPal. Recurring subscriptions pay every month.",
      icon: <DollarSign className="w-6 h-6" />,
    },
  ];

  const perks = [
    "40% commission on every sale — one of the highest in the industry",
    "Recurring monthly commissions on Conscious Claims subscriptions",
    "Real-time dashboard to track clicks, conversions, and earnings",
    "Marketing materials: email swipes, social posts, and video clips",
    "Monthly PayPal payouts with no minimum threshold",
    "Dedicated support from Cody's team",
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Application Received!</h1>
          <p className="text-gray-400 text-lg mb-6">
            We'll review your application and activate your account within 24 hours. Check your
            email for confirmation.
          </p>
          {referralCode && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6 mb-6">
              <p className="text-orange-400 font-semibold mb-2">Your Referral Code (pending activation):</p>
              <div className="text-3xl font-bold tracking-widest text-white">{referralCode}</div>
              <p className="text-gray-500 text-sm mt-2">
                Your link will be: consconscioussupplements.com/?ref={referralCode}
              </p>
            </div>
          )}
          <div className="flex gap-3 justify-center">
            <Link href="/">
              <Button variant="outline" className="border-gray-700">
                Back to Home
              </Button>
            </Link>
            <Link href="/affiliate-dashboard">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/">
            <span className="text-xl font-bold text-orange-400 cursor-pointer">
              Conscious Claims
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/affiliate-dashboard">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                My Dashboard
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                Pricing
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-950/40 via-gray-950 to-gray-950" />
        <div className="relative max-w-6xl mx-auto px-6 py-20 text-center">
          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 mb-6 text-sm px-4 py-1">
            Affiliate Program
          </Badge>
          <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
            Earn{" "}
            <span className="text-orange-400">40% Commission</span>
            <br />
            on Every Sale
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Promote Conscious Claims to roofing contractors and earn recurring monthly commissions.
            The more they use it, the more you earn — every single month.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mb-12">
            <div className="bg-gray-900 border border-gray-800 rounded-xl px-6 py-4 text-center">
              <div className="text-3xl font-black text-orange-400">40%</div>
              <div className="text-gray-500 text-sm">Commission Rate</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl px-6 py-4 text-center">
              <div className="text-3xl font-black text-green-400">$38.80</div>
              <div className="text-gray-500 text-sm">Per Month / Per Sub</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl px-6 py-4 text-center">
              <div className="text-3xl font-black text-blue-400">Monthly</div>
              <div className="text-gray-500 text-sm">PayPal Payouts</div>
            </div>
          </div>
          <a href="#apply">
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-10 py-6 rounded-xl">
              Apply to Be an Affiliate <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </a>
        </div>
      </section>

      {/* Commission Table */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-3">What You Earn</h2>
        <p className="text-gray-400 text-center mb-10">
          Every product pays 40%. Subscriptions pay every month for as long as they stay subscribed.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {commissions.map((c) => (
            <Card key={c.product} className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className={`text-sm font-semibold mb-1 ${c.color}`}>{c.type}</div>
                <h3 className="text-lg font-bold text-white mb-2">{c.product}</h3>
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-gray-500 text-sm">Sale price:</span>
                  <span className="text-white font-semibold">{c.price}</span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-gray-500 text-sm">You earn:</span>
                  <span className={`text-2xl font-black ${c.color}`}>{c.commission}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-6 bg-orange-500/10 border border-orange-500/20 rounded-xl p-5 text-center">
          <p className="text-orange-300 font-semibold">
            💡 Refer just 10 contractors to Conscious Claims Pro and earn{" "}
            <span className="text-orange-400 text-xl font-black">$388/month</span> in passive income.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-900/50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-3">How It Works</h2>
          <p className="text-gray-400 text-center mb-12">Four simple steps to start earning</p>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-14 h-14 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-400">
                  {s.icon}
                </div>
                <div className="text-orange-400 text-sm font-bold mb-2">Step {s.step}</div>
                <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                <p className="text-gray-400 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Perks */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Why Promote Conscious Claims?</h2>
            <div className="space-y-4">
              {perks.map((perk, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">{perk}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Zap className="w-6 h-6 text-yellow-400" />
                  <h3 className="font-bold text-white">High-Converting Product</h3>
                </div>
                <p className="text-gray-400 text-sm">
                  Roofing contractors are actively looking for tools to recover more money from
                  insurance claims. Conscious Claims solves a real, painful problem.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <BarChart3 className="w-6 h-6 text-blue-400" />
                  <h3 className="font-bold text-white">Real-Time Tracking</h3>
                </div>
                <p className="text-gray-400 text-sm">
                  Your dashboard shows every click, every conversion, and your exact earnings
                  in real time. No guessing, no waiting.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Gift className="w-6 h-6 text-pink-400" />
                  <h3 className="font-bold text-white">Bonus: Free E-Book</h3>
                </div>
                <p className="text-gray-400 text-sm">
                  Affiliates get a free copy of "Storm the Door" ($27 value) to use as a
                  conversation starter with roofing contacts.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="bg-gray-900/50 py-16">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">Apply to Become an Affiliate</h2>
            <p className="text-gray-400">
              Takes 2 minutes. We review and activate within 24 hours.
            </p>
          </div>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300 mb-2 block">
                      Full Name <span className="text-orange-400">*</span>
                    </Label>
                    <Input
                      placeholder="Cody McCain"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300 mb-2 block">
                      Email Address <span className="text-orange-400">*</span>
                    </Label>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300 mb-2 block">Phone (optional)</Label>
                    <Input
                      type="tel"
                      placeholder="(555) 000-0000"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300 mb-2 block">Company / Business (optional)</Label>
                    <Input
                      placeholder="Your Roofing Co."
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-gray-300 mb-2 block">
                    PayPal Email for Payouts (optional — can add later)
                  </Label>
                  <Input
                    type="email"
                    placeholder="paypal@example.com"
                    value={form.paypalEmail}
                    onChange={(e) => setForm({ ...form, paypalEmail: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                  />
                </div>

                <div>
                  <Label className="text-gray-300 mb-2 block">
                    How will you promote Conscious Claims? (optional)
                  </Label>
                  <Textarea
                    placeholder="e.g. I have a roofing Facebook group with 2,000 contractors, I run YouTube ads, I'm a roofing coach..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 min-h-[100px]"
                  />
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={submitMutation.isPending}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white text-lg py-6 rounded-xl"
                >
                  {submitMutation.isPending ? (
                    "Submitting..."
                  ) : (
                    <>
                      Submit Application <ArrowRight className="ml-2 w-5 h-5" />
                    </>
                  )}
                </Button>

                <p className="text-gray-500 text-xs text-center">
                  By applying, you agree to our affiliate terms. Commissions are paid monthly
                  via PayPal for the previous month's verified sales.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-10">Common Questions</h2>
        <div className="space-y-6">
          {[
            {
              q: "When do I get paid?",
              a: "Commissions are paid on the 1st of each month via PayPal for all verified sales from the previous month. There is no minimum payout threshold.",
            },
            {
              q: "How long does the referral cookie last?",
              a: "30 days. If someone clicks your link and subscribes within 30 days, you get credit for the sale.",
            },
            {
              q: "Do I earn on renewals?",
              a: "Yes. For Conscious Claims Pro subscriptions, you earn 40% every month for as long as the customer stays subscribed. This is true recurring commission.",
            },
            {
              q: "Can I promote on social media?",
              a: "Absolutely. Facebook, Instagram, TikTok, YouTube, email newsletters — any channel is fair game. We'll provide marketing materials to help.",
            },
            {
              q: "Is there a cost to join?",
              a: "No. The affiliate program is completely free to join.",
            },
          ].map((faq, i) => (
            <div key={i} className="border-b border-gray-800 pb-6">
              <h3 className="font-bold text-white mb-2">{faq.q}</h3>
              <p className="text-gray-400">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-orange-500/10 border-t border-orange-500/20 py-12 text-center px-6">
        <h2 className="text-2xl font-bold mb-3">Ready to Start Earning?</h2>
        <p className="text-gray-400 mb-6">
          Join roofing professionals already earning recurring commissions with Conscious Claims.
        </p>
        <a href="#apply">
          <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-6 text-lg rounded-xl">
            Apply Now — It's Free <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </a>
      </section>
    </div>
  );
}
