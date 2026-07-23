import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";
import {
  ArrowRight,
  Building2,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  DollarSign,
  FileText,
  Mail,
  MapPin,
  Zap,
} from "lucide-react";

const DEMO_JOB = {
  propertyAddress: "1847 Magnolia Drive, Marietta, GA 30062",
  homeownerName: "Robert & Linda Hargrove",
  claimNumber: "HO-2024-887341",
  insuranceCarrier: "State Farm Insurance",
  adjusterName: "Michael Torres",
  adjusterEmail: "m.torres@statefarm.com",
  dateOfLoss: "October 14, 2024",
  originalEstimate: 12480.0,
  recoveredAmount: 6840.0,
  feePercentage: 12,
};

const DEMO_LINE_ITEMS = [
  {
    id: 1,
    xactimateCode: "RFG STRT",
    description: "Starter Strip Shingles",
    quantity: 14.2,
    unit: "SQ",
    unitPrice: 42.5,
    totalPrice: 603.5,
    justification:
      "IRC R905.2.8.2 requires starter strip shingles at eaves and rakes. Not included in original estimate. Manufacturer installation requirements (GAF, CertainTeed) mandate starter strip for warranty compliance.",
    included: true,
  },
  {
    id: 2,
    xactimateCode: "RFG DRIP",
    description: "Drip Edge — Eaves & Rakes",
    quantity: 312,
    unit: "LF",
    unitPrice: 2.85,
    totalPrice: 889.2,
    justification:
      "IRC R905.2.8.5 requires drip edge at eaves and rakes. Missing from original estimate. Required by all major shingle manufacturers for warranty validity.",
    included: true,
  },
  {
    id: 3,
    xactimateCode: "RFG VMTL",
    description: "Valley Metal (Open Valley)",
    quantity: 68,
    unit: "LF",
    unitPrice: 5.2,
    totalPrice: 353.6,
    justification:
      "IRC R905.2.8.2 requires valley flashing. Open valley metal not included in original estimate. Field conditions show open valley construction requiring metal valley liner.",
    included: true,
  },
  {
    id: 4,
    xactimateCode: "RFG STPFLSH",
    description: "Step Flashing — Chimney & Dormers",
    quantity: 84,
    unit: "LF",
    unitPrice: 8.75,
    totalPrice: 735.0,
    justification:
      "IRC R903.2 requires step flashing at all roof-to-wall intersections. Chimney and dormer step flashing omitted from original estimate. Required to prevent water infiltration.",
    included: true,
  },
  {
    id: 5,
    xactimateCode: "RFG FLPIPE",
    description: "Pipe Boot Flashings (4 units)",
    quantity: 4,
    unit: "EA",
    unitPrice: 38.0,
    totalPrice: 152.0,
    justification:
      "4 plumbing vents visible in photos require new pipe boot flashings. Original estimate omitted all pipe boots. New boots required when re-roofing per manufacturer installation guides.",
    included: true,
  },
  {
    id: 6,
    xactimateCode: "RFG ICEWATER",
    description: "Ice & Water Shield — Eaves (3 ft)",
    quantity: 4.26,
    unit: "SQ",
    unitPrice: 98.0,
    totalPrice: 417.48,
    justification:
      "IRC R905.2.7.1 requires ice barrier in climate zones 1-8 for the first 24 inches inside the exterior wall line. Georgia is in Climate Zone 3. Not included in original estimate.",
    included: true,
  },
  {
    id: 7,
    xactimateCode: "GUT D&R",
    description: "Gutter Detach & Reset",
    quantity: 186,
    unit: "LF",
    unitPrice: 4.5,
    totalPrice: 837.0,
    justification:
      "186 LF of gutters must be detached and reset to properly install drip edge per manufacturer requirements. Original estimate did not include gutter D&R. Required for correct drip edge installation sequence.",
    included: true,
  },
  {
    id: 8,
    xactimateCode: "PERMIT",
    description: "Building Permit",
    quantity: 1,
    unit: "EA",
    unitPrice: 285.0,
    totalPrice: 285.0,
    justification:
      "Marietta, GA requires a building permit for full roof replacement. Permit cost not included in original estimate. Required by local ordinance before work can begin.",
    included: true,
  },
  {
    id: 9,
    xactimateCode: "RFG RDGE CAP",
    description: "Ridge Cap Shingles",
    quantity: 8.4,
    unit: "LF",
    unitPrice: 6.2,
    totalPrice: 52.08,
    justification:
      "Hip and ridge cap shingles are a separate line item from field shingles. Original estimate bundled ridge cap into shingle squares without proper pricing. Manufacturer requires specific ridge cap product.",
    included: true,
  },
  {
    id: 10,
    xactimateCode: "RFG DKSHTH",
    description: "Roof Deck Sheathing — Partial Replacement",
    quantity: 3.5,
    unit: "SQ",
    unitPrice: 145.0,
    totalPrice: 507.5,
    justification:
      "Photo analysis shows 3–4 squares of deteriorated OSB deck sheathing requiring replacement. Original estimate did not account for deck repairs. IRC R803.1 requires sound structural deck before shingle installation.",
    included: true,
  },
  {
    id: 11,
    xactimateCode: "RFG FELTBK",
    description: "Synthetic Underlayment Upgrade",
    quantity: 14.2,
    unit: "SQ",
    unitPrice: 22.0,
    totalPrice: 312.4,
    justification:
      "Synthetic underlayment (30 lb equivalent) required per manufacturer warranty terms. Original estimate used 15 lb felt pricing. Upgrade required for warranty compliance.",
    included: false,
  },
];

const DEMO_EMAIL = `Subject: Supplement Request — Claim HO-2024-887341 | 1847 Magnolia Drive, Marietta, GA

Dear Mr. Torres,

I am writing to formally request a supplement to claim HO-2024-887341 for the property at 1847 Magnolia Drive, Marietta, GA 30062. After a thorough review of the original Xactimate estimate dated October 22, 2024, we have identified the following line items that were omitted from the original scope of work.

SUPPLEMENT LINE ITEMS REQUESTED:

1. Starter Strip Shingles (RFG STRT) — $603.50
   IRC R905.2.8.2 requires starter strip shingles at eaves and rakes. GAF and CertainTeed manufacturer installation requirements mandate starter strip for warranty compliance. This item was not included in the original estimate.

2. Drip Edge — Eaves & Rakes (RFG DRIP) — $889.20
   IRC R905.2.8.5 requires drip edge at eaves and rakes. 312 LF of drip edge is required for this roof. Missing from original estimate.

3. Valley Metal (RFG VMTL) — $353.60
   IRC R905.2.8.2 requires valley flashing. Open valley construction is present on this roof requiring 68 LF of metal valley liner. Not included in original estimate.

4. Step Flashing — Chimney & Dormers (RFG STPFLSH) — $735.00
   IRC R903.2 requires step flashing at all roof-to-wall intersections. 84 LF of step flashing at the chimney and dormers was omitted from the original estimate.

5. Pipe Boot Flashings (RFG FLPIPE) — $152.00
   4 plumbing vents require new pipe boot flashings. All 4 were omitted from the original estimate. Required per manufacturer installation guidelines when re-roofing.

6. Ice & Water Shield (RFG ICEWATER) — $417.48
   IRC R905.2.7.1 requires ice barrier in climate zones 1-8. Georgia is Climate Zone 3. The first 24 inches inside the exterior wall line requires ice and water shield. Not included in original estimate.

7. Gutter Detach & Reset (GUT D&R) — $837.00
   186 LF of gutters must be detached and reset to properly install drip edge per manufacturer requirements. Required for correct installation sequence. Not included in original estimate.

8. Building Permit (PERMIT) — $285.00
   Marietta, GA requires a building permit for full roof replacement per local ordinance. Permit cost not included in original estimate.

9. Ridge Cap Shingles (RFG RDGE CAP) — $52.08
   Hip and ridge cap shingles are a separate line item. Original estimate did not properly price ridge cap as a distinct product.

10. Partial Deck Sheathing Replacement (RFG DKSHTH) — $507.50
    Photo documentation shows approximately 3.5 squares of deteriorated OSB deck sheathing requiring replacement. IRC R803.1 requires sound structural deck before shingle installation.

TOTAL SUPPLEMENT REQUESTED: $4,832.36

All supplement items are supported by IRC building codes, manufacturer installation requirements, and field documentation. Photos and code references are available upon request.

Please review and respond within 10 business days. I am available to discuss any of these items at your convenience.

Respectfully,
Cody Tyler McCain
Conscious Claims | SupplementAI
cody@conscioussupplements.com`;

export default function Demo() {
  const [, navigate] = useLocation();
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<"supplement" | "email">("supplement");

  const toggleItem = (id: number) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const includedItems = DEMO_LINE_ITEMS.filter((i) => i.included);
  const total = includedItems.reduce((sum, i) => sum + i.totalPrice, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Video Hero Section */}
      <div className="bg-gradient-to-b from-[#0a0f1e] to-background py-10">
        <div className="container max-w-4xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Watch the Demo — <span className="text-[#c9a84c]">$4,832 Found in 30 Seconds</span></h2>
            <p className="text-gray-400 text-sm">Real estimate. Real photos. Watch the AI find every missed line item and write the adjuster email automatically.</p>
          </div>
          <div className="relative w-full rounded-2xl overflow-hidden border border-[#c9a84c]/30 shadow-2xl">
            <video
              id="demo-video"
              className="w-full h-auto block"
              controls
              playsInline
              preload="metadata"
              poster="https://d2xsxph8kpxj0f.cloudfront.net/310519663360996271/3ZX44EBEWux9xrkumJtpAc/hero_roof_bg-She6uHfiWBu6q3JNUfzwPa.png"
            >
              <source src="https://d2xsxph8kpxj0f.cloudfront.net/310519663360996271/3ZX44EBEWux9xrkumJtpAc/260a9a71ec654358b8a0973799f5a9a3_a0b8a704.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>
      {/* Nav */}
      <nav className="border-b border-border bg-[#0a0f1e]/95 backdrop-blur-sm sticky top-0 z-50 border-b border-[#c9a84c]/20">
        <div className="container flex items-center justify-between h-16">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663360996271/3ZX44EBEWux9xrkumJtpAc/cc_logo_transparent_0cf366e7.png"
              alt="Conscious Claims"
              className="w-8 h-8 rounded-lg object-cover"
            />
            <span className="font-bold text-lg text-foreground">SupplementAI</span>
            <span className="hidden sm:inline text-xs text-muted-foreground font-normal">
              by Conscious Claims
            </span>
          </button>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="hidden sm:flex">
              <Zap className="w-3 h-3 mr-1" />
              Live Demo
            </Badge>
            <Button size="sm" onClick={() => (window.location.href = getLoginUrl())}>
              Start Free Trial
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Demo Banner */}
      <div className="bg-accent/10 border-b border-accent/20 py-3">
        <div className="container flex items-center justify-center gap-3 text-sm">
          <Zap className="w-4 h-4 text-accent" />
          <span className="text-foreground font-medium">
            This is a live demo with sample data. Sign up free to run this on your own jobs.
          </span>
          <Button
            size="sm"
            variant="outline"
            className="ml-2 h-7 text-xs"
            onClick={() => (window.location.href = getLoginUrl())}
          >
            Get Started Free
          </Button>
        </div>
      </div>

      <div className="container py-8 max-w-5xl">
        {/* Job Header */}
        <div className="bg-white border border-border rounded-2xl p-6 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <h1 className="text-xl font-bold text-foreground">{DEMO_JOB.propertyAddress}</h1>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Homeowner:</span>{" "}
                  <span className="font-medium">{DEMO_JOB.homeownerName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Claim #:</span>{" "}
                  <span className="font-medium font-mono">{DEMO_JOB.claimNumber}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Carrier:</span>{" "}
                  <span className="font-medium">{DEMO_JOB.insuranceCarrier}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Adjuster:</span>{" "}
                  <span className="font-medium">{DEMO_JOB.adjusterName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Date of Loss:</span>{" "}
                  <span className="font-medium">{DEMO_JOB.dateOfLoss}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-4 shrink-0">
              <div className="text-center bg-background rounded-xl border border-border px-4 py-3">
                <div className="text-xs text-muted-foreground mb-1">Original Estimate</div>
                <div className="text-xl font-bold text-foreground">
                  ${DEMO_JOB.originalEstimate.toLocaleString()}
                </div>
              </div>
              <div className="text-center bg-green-50 rounded-xl border border-green-200 px-4 py-3">
                <div className="text-xs text-green-700 mb-1">Supplement Found</div>
                <div className="text-xl font-bold text-green-700">${total.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-muted rounded-xl p-1 w-fit">
          <button
            onClick={() => setActiveTab("supplement")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "supplement"
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="w-4 h-4" />
            Supplement Items ({includedItems.length})
          </button>
          <button
            onClick={() => setActiveTab("email")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "email"
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Mail className="w-4 h-4" />
            Adjuster Email
          </button>
        </div>

        {activeTab === "supplement" && (
          <>
            {/* Summary Card */}
            <div className="bg-primary text-primary-foreground rounded-2xl p-6 mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-primary-foreground/60 text-xs mb-1">Line Items Found</div>
                  <div className="text-3xl font-extrabold">{includedItems.length}</div>
                </div>
                <div>
                  <div className="text-primary-foreground/60 text-xs mb-1">Total Supplement</div>
                  <div className="text-3xl font-extrabold text-accent">${total.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-primary-foreground/60 text-xs mb-1">
                    Your {DEMO_JOB.feePercentage}% Fee
                  </div>
                  <div className="text-3xl font-extrabold">
                    ${(total * (DEMO_JOB.feePercentage / 100)).toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-primary-foreground/60 text-xs mb-1">New Total Estimate</div>
                  <div className="text-3xl font-extrabold">
                    ${(DEMO_JOB.originalEstimate + total).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-3">
              {DEMO_LINE_ITEMS.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white border rounded-xl overflow-hidden transition-all ${
                    item.included ? "border-border" : "border-border/50 opacity-60"
                  }`}
                >
                  <div
                    className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => toggleItem(item.id)}
                  >
                    <CheckCircle
                      className={`w-5 h-5 shrink-0 ${
                        item.included ? "text-green-500" : "text-muted-foreground"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">
                          {item.xactimateCode}
                        </span>
                        <span className="font-semibold text-foreground text-sm">{item.description}</span>
                        {!item.included && (
                          <Badge variant="outline" className="text-xs">
                            Excluded
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {item.quantity} {item.unit} × ${item.unitPrice.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-foreground">${item.totalPrice.toFixed(2)}</div>
                    </div>
                    {expandedItems.has(item.id) ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}
                  </div>
                  {expandedItems.has(item.id) && (
                    <div className="px-4 pb-4 border-t border-border/50 bg-muted/20">
                      <p className="text-sm text-muted-foreground leading-relaxed pt-3">
                        <span className="font-semibold text-foreground">Justification: </span>
                        {item.justification}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-6 bg-white border-2 border-primary rounded-xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DollarSign className="w-6 h-6 text-primary" />
                <div>
                  <div className="font-bold text-foreground text-lg">Total Supplement Value</div>
                  <div className="text-sm text-muted-foreground">
                    {includedItems.length} line items identified by AI analysis
                  </div>
                </div>
              </div>
              <div className="text-3xl font-extrabold text-primary">${total.toFixed(2)}</div>
            </div>
          </>
        )}

        {activeTab === "email" && (
          <div className="bg-white border border-border rounded-2xl overflow-hidden">
            <div className="border-b border-border px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                <span className="font-semibold text-foreground">AI-Generated Adjuster Email</span>
              </div>
              <Badge variant="secondary">Ready to Send</Badge>
            </div>
            <div className="p-6">
              <pre className="text-sm text-foreground leading-relaxed whitespace-pre-wrap font-sans">
                {DEMO_EMAIL}
              </pre>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-10 bg-gradient-to-br from-primary via-primary/90 to-[oklch(0.22_0.08_250)] rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-3">Ready to Run This on Your Own Jobs?</h2>
          <p className="text-white/80 mb-6 max-w-lg mx-auto">
            Sign up free and upload your first Xactimate estimate. SupplementAI will find every missing line item in under 5 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
              onClick={() => (window.location.href = getLoginUrl())}
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white bg-white/10 hover:bg-white/20"
              onClick={() => navigate("/pricing")}
            >
              View Pricing
            </Button>
          </div>
          <p className="mt-4 text-xs text-white/50">No credit card required. Free to start.</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-white py-8 mt-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <Building2 className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">SupplementAI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SupplementAI by Conscious Claims.
          </p>
        </div>
      </footer>
    </div>
  );
}
