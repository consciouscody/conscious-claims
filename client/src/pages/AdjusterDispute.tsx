import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  Copy,
  Download,
  Plus,
  X,
  ChevronDown,
  Shield,
  Zap,
  BookOpen,
} from "lucide-react";

const DISPUTE_TYPES = [
  {
    value: "underpaid",
    label: "Underpaid Line Items",
    description: "Adjuster paid less than the correct Xactimate amount",
    color: "text-yellow-400",
    icon: AlertTriangle,
  },
  {
    value: "denied_items",
    label: "Denied Line Items",
    description: "Adjuster denied items required by code or manufacturer",
    color: "text-red-400",
    icon: X,
  },
  {
    value: "full_denial",
    label: "Full Claim Denial",
    description: "Entire claim was denied — demand re-inspection",
    color: "text-red-500",
    icon: Shield,
  },
  {
    value: "depreciation",
    label: "Withheld Depreciation",
    description: "Recoverable depreciation being held back",
    color: "text-orange-400",
    icon: Zap,
  },
];

export default function AdjusterDispute() {
  const [disputeType, setDisputeType] = useState<"underpaid" | "denied_items" | "full_denial" | "depreciation">("underpaid");
  const [claimDetails, setClaimDetails] = useState({
    claimNumber: "",
    propertyAddress: "",
    dateOfLoss: "",
    insuranceCompany: "",
    adjusterName: "",
    contractorName: "",
  });
  const [adjusterScopeText, setAdjusterScopeText] = useState("");
  const [deniedItems, setDeniedItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState("");
  const [generatedLetter, setGeneratedLetter] = useState<string | null>(null);
  const [summary, setSummary] = useState<{
    keyPoints: string[];
    citedStandards: string[];
    estimatedRecovery: string;
    urgency: string;
  } | null>(null);

  const generateMutation = trpc.dispute.generateLetter.useMutation({
    onSuccess: (data) => {
      setGeneratedLetter(data.letter);
      setSummary(data.summary);
      toast.success("Dispute letter generated!", { description: "Review and copy your professional dispute letter below." });
      setTimeout(() => {
        document.getElementById("letter-output")?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    },
    onError: (err) => {
      toast.error("Generation failed", { description: err.message });
    },
  });

  const addDeniedItem = () => {
    if (newItem.trim()) {
      setDeniedItems([...deniedItems, newItem.trim()]);
      setNewItem("");
    }
  };

  const removeDeniedItem = (index: number) => {
    setDeniedItems(deniedItems.filter((_, i) => i !== index));
  };

  const handleGenerate = () => {
    generateMutation.mutate({
      disputeType,
      claimDetails,
      adjusterScopeText: adjusterScopeText || undefined,
      deniedItems: deniedItems.length > 0 ? deniedItems : undefined,
    });
  };

  const copyLetter = () => {
    if (generatedLetter) {
      navigator.clipboard.writeText(generatedLetter);
      toast.success("Copied!", { description: "Letter copied to clipboard." });
    }
  };

  const downloadLetter = () => {
    if (!generatedLetter) return;
    const blob = new Blob([generatedLetter], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dispute-letter-${claimDetails.claimNumber || "claim"}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const urgencyColor = {
    high: "bg-red-500/20 text-red-400 border-red-500/30",
    medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    low: "bg-green-500/20 text-green-400 border-green-500/30",
  };

  return (
    <div className="min-h-screen" style={{ background: "#070a12" }}>
      <div className="container py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "rgba(245,200,66,0.1)", border: "1px solid rgba(245,200,66,0.2)" }}>
              <FileText className="w-5 h-5" style={{ color: "#f5c842" }} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                ADJUSTER DISPUTE LETTER
              </h1>
              <p className="text-gray-400 text-sm">AI-generated professional dispute letters citing IRC codes, HAAG standards & Owens Corning requirements</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left — Input Form */}
          <div className="space-y-5">
            {/* Dispute Type */}
            <div className="rounded-xl p-5" style={{ background: "#0d1120", border: "1px solid rgba(255,255,255,0.06)" }}>
              <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wider">Dispute Type</h3>
              <div className="grid grid-cols-1 gap-2">
                {DISPUTE_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      onClick={() => setDisputeType(type.value as typeof disputeType)}
                      className="flex items-center gap-3 p-3 rounded-lg text-left transition-all"
                      style={{
                        background: disputeType === type.value ? "rgba(245,200,66,0.08)" : "rgba(255,255,255,0.02)",
                        border: disputeType === type.value ? "1px solid rgba(245,200,66,0.3)" : "1px solid rgba(255,255,255,0.04)",
                      }}
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 ${type.color}`} />
                      <div>
                        <div className="text-white text-sm font-semibold">{type.label}</div>
                        <div className="text-gray-500 text-xs">{type.description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Claim Details */}
            <div className="rounded-xl p-5" style={{ background: "#0d1120", border: "1px solid rgba(255,255,255,0.06)" }}>
              <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wider">Claim Details</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "claimNumber", label: "Claim Number", placeholder: "e.g. CLM-2024-001" },
                  { key: "propertyAddress", label: "Property Address", placeholder: "123 Main St" },
                  { key: "dateOfLoss", label: "Date of Loss", placeholder: "MM/DD/YYYY" },
                  { key: "insuranceCompany", label: "Insurance Company", placeholder: "e.g. State Farm" },
                  { key: "adjusterName", label: "Adjuster Name", placeholder: "John Smith" },
                  { key: "contractorName", label: "Your Name / Company", placeholder: "Cody McCain — Conscious Claims" },
                ].map((field) => (
                  <div key={field.key} className={field.key === "propertyAddress" || field.key === "contractorName" ? "col-span-2" : ""}>
                    <label className="text-gray-400 text-xs mb-1 block">{field.label}</label>
                    <Input
                      placeholder={field.placeholder}
                      value={claimDetails[field.key as keyof typeof claimDetails]}
                      onChange={(e) => setClaimDetails({ ...claimDetails, [field.key]: e.target.value })}
                      className="bg-transparent border-white/10 text-white placeholder:text-gray-600 text-sm focus:border-yellow-500/50"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Denied / Underpaid Items */}
            <div className="rounded-xl p-5" style={{ background: "#0d1120", border: "1px solid rgba(255,255,255,0.06)" }}>
              <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wider">Denied / Underpaid Items</h3>
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder="e.g. Drip Edge, Starter Strip, Ice & Water Shield..."
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addDeniedItem()}
                  className="bg-transparent border-white/10 text-white placeholder:text-gray-600 text-sm focus:border-yellow-500/50"
                />
                <Button onClick={addDeniedItem} size="sm" className="flex-shrink-0" style={{ background: "rgba(245,200,66,0.15)", color: "#f5c842", border: "1px solid rgba(245,200,66,0.3)" }}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {deniedItems.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {deniedItems.map((item, i) => (
                    <span key={i} className="flex items-center gap-1 px-2 py-1 rounded-md text-xs" style={{ background: "rgba(245,200,66,0.08)", border: "1px solid rgba(245,200,66,0.2)", color: "#f5c842" }}>
                      {item}
                      <button onClick={() => removeDeniedItem(i)} className="hover:text-white ml-1">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Adjuster Scope Notes */}
            <div className="rounded-xl p-5" style={{ background: "#0d1120", border: "1px solid rgba(255,255,255,0.06)" }}>
              <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wider">Adjuster Scope Notes (Optional)</h3>
              <Textarea
                placeholder="Paste the adjuster's notes, denial reason, or scope of loss here. The AI will use this to craft a targeted rebuttal..."
                value={adjusterScopeText}
                onChange={(e) => setAdjusterScopeText(e.target.value)}
                rows={4}
                className="bg-transparent border-white/10 text-white placeholder:text-gray-600 text-sm focus:border-yellow-500/50 resize-none"
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={generateMutation.isPending}
              className="w-full py-5 text-base font-bold"
              style={{ background: "linear-gradient(135deg, #f5c842 0%, #e6b800 100%)", color: "#070a12" }}
            >
              {generateMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Generating Dispute Letter...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Generate Dispute Letter
                </span>
              )}
            </Button>
          </div>

          {/* Right — Output */}
          <div className="space-y-5">
            {!generatedLetter && !generateMutation.isPending && (
              <div className="rounded-xl p-8 flex flex-col items-center justify-center text-center min-h-64" style={{ background: "#0d1120", border: "1px dashed rgba(255,255,255,0.08)" }}>
                <BookOpen className="w-12 h-12 text-gray-600 mb-4" />
                <p className="text-gray-500 text-sm max-w-xs">Fill in the claim details and click Generate. The AI will write a professional dispute letter citing IRC codes, HAAG standards, and Owens Corning requirements.</p>
              </div>
            )}

            {generateMutation.isPending && (
              <div className="rounded-xl p-8 flex flex-col items-center justify-center text-center min-h-64" style={{ background: "#0d1120", border: "1px solid rgba(245,200,66,0.1)" }}>
                <div className="w-10 h-10 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-yellow-400 font-semibold text-sm">Writing your dispute letter...</p>
                <p className="text-gray-500 text-xs mt-1">Citing IRC codes, HAAG standards & OC requirements</p>
              </div>
            )}

            {summary && (
              <div className="rounded-xl p-5" style={{ background: "#0d1120", border: "1px solid rgba(255,255,255,0.06)" }}>
                <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wider">Letter Summary</h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-gray-400 text-xs">Urgency:</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${urgencyColor[summary.urgency as keyof typeof urgencyColor] || urgencyColor.medium}`}>
                    {summary.urgency?.toUpperCase()}
                  </span>
                  {summary.estimatedRecovery && summary.estimatedRecovery !== "N/A" && (
                    <span className="text-xs px-2 py-0.5 rounded-full border font-semibold" style={{ background: "rgba(245,200,66,0.1)", color: "#f5c842", borderColor: "rgba(245,200,66,0.3)" }}>
                      Recovery: {summary.estimatedRecovery}
                    </span>
                  )}
                </div>
                {summary.keyPoints?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-gray-500 text-xs mb-1.5 uppercase tracking-wider">Key Arguments</p>
                    <ul className="space-y-1">
                      {summary.keyPoints.slice(0, 4).map((point, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                          <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0 mt-0.5" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {summary.citedStandards?.length > 0 && (
                  <div>
                    <p className="text-gray-500 text-xs mb-1.5 uppercase tracking-wider">Standards Cited</p>
                    <div className="flex flex-wrap gap-1">
                      {summary.citedStandards.map((std, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.04)", color: "#94a3b8" }}>
                          {std}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {generatedLetter && (
              <div id="letter-output" className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(245,200,66,0.2)" }}>
                <div className="flex items-center justify-between px-4 py-3" style={{ background: "rgba(245,200,66,0.06)", borderBottom: "1px solid rgba(245,200,66,0.1)" }}>
                  <span className="text-yellow-400 font-bold text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Dispute Letter — Ready to Send
                  </span>
                  <div className="flex gap-2">
                    <Button onClick={copyLetter} size="sm" variant="outline" className="h-7 text-xs border-white/10 text-gray-300 hover:text-white">
                      <Copy className="w-3 h-3 mr-1" /> Copy
                    </Button>
                    <Button onClick={downloadLetter} size="sm" variant="outline" className="h-7 text-xs border-white/10 text-gray-300 hover:text-white">
                      <Download className="w-3 h-3 mr-1" /> Download
                    </Button>
                  </div>
                </div>
                <div className="p-4 max-h-96 overflow-y-auto" style={{ background: "#0a0e1a" }}>
                  <pre className="text-gray-300 text-xs leading-relaxed whitespace-pre-wrap font-mono">{generatedLetter}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
