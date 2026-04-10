import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Camera, Upload, CheckCircle2, AlertTriangle, XCircle,
  Loader2, ChevronDown, ChevronUp, DollarSign, Lightbulb,
  Star, Eye, RefreshCw, Info, ArrowRight, Zap
} from "lucide-react";

type ChecklistItem = {
  id: string;
  category: string;
  categoryOrder: number;
  label: string;
  required: boolean;
  moneyAtRisk: string | null;
  instruction: string;
  whyItMatters: string;
  tips: string[];
};

type PhotoAnalysis = {
  damageVisible: string;
  qualityScore: number;
  qualityReason: string;
  framingSuggestions: string;
  adjusterDescription: string;
  missingElements: string;
  moneyImpact: string;
  isApprovalReady: boolean;
};

type UploadedPhoto = {
  url: string;
  file: File;
  analysis: PhotoAnalysis | null;
  analyzing: boolean;
};

function scoreColor(score: number) {
  if (score >= 8) return "text-green-400";
  if (score >= 5) return "text-amber-400";
  return "text-red-400";
}

function scoreBg(score: number) {
  if (score >= 8) return "bg-green-950 border-green-800";
  if (score >= 5) return "bg-amber-950 border-amber-800";
  return "bg-red-950 border-red-800";
}

function PhotoSlot({
  item,
  photo,
  onUpload,
  onAnalyze,
  onRemove,
}: {
  item: ChecklistItem;
  photo: UploadedPhoto | null;
  onUpload: (file: File) => void;
  onAnalyze: () => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const hasPhoto = !!photo;
  const isReady = photo?.analysis?.isApprovalReady;
  const score = photo?.analysis?.qualityScore;

  return (
    <div className={`rounded-xl border transition-all ${
      isReady ? "border-green-700 bg-green-950/20" :
      hasPhoto ? "border-amber-700 bg-amber-950/10" :
      item.required ? "border-red-900/60 bg-red-950/10" : "border-border bg-card"
    }`}>
      {/* Header row */}
      <div className="flex items-start gap-3 p-4">
        {/* Status icon */}
        <div className="shrink-0 mt-0.5">
          {isReady ? (
            <CheckCircle2 className="w-5 h-5 text-green-400" />
          ) : hasPhoto ? (
            score !== undefined ? (
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${scoreBg(score)} ${scoreColor(score)}`}>
                {score}
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-amber-500 bg-amber-950/30" />
            )
          ) : item.required ? (
            <AlertTriangle className="w-5 h-5 text-red-400" />
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-border" />
          )}
        </div>

        {/* Label + badges */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <p className="text-sm font-semibold text-foreground">{item.label}</p>
            {item.required && !isReady && (
              <Badge className="bg-red-900 text-red-200 text-[10px] px-1.5 py-0">REQUIRED</Badge>
            )}
            {item.moneyAtRisk && !isReady && (
              <Badge className="bg-amber-900 text-amber-200 text-[10px] px-1.5 py-0 flex items-center gap-0.5">
                <DollarSign className="w-2.5 h-2.5" />{item.moneyAtRisk} at risk
              </Badge>
            )}
            {isReady && (
              <Badge className="bg-green-900 text-green-200 text-[10px] px-1.5 py-0">✓ Adjuster Ready</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">{item.instruction}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {!hasPhoto ? (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs flex items-center gap-1.5"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="w-3.5 h-3.5" />
              Upload
            </Button>
          ) : (
            <>
              {!photo.analysis && !photo.analyzing && (
                <Button
                  size="sm"
                  className="h-8 text-xs flex items-center gap-1.5 bg-primary"
                  onClick={onAnalyze}
                >
                  <Zap className="w-3.5 h-3.5" />
                  Analyze
                </Button>
              )}
              {photo.analyzing && (
                <Button size="sm" disabled className="h-8 text-xs">
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                  Analyzing...
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-red-400"
                onClick={onRemove}
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-muted-foreground"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
            e.target.value = "";
          }}
        />
      </div>

      {/* Photo preview + analysis */}
      {hasPhoto && (
        <div className="px-4 pb-4 border-t border-border/30 pt-3">
          <div className="flex gap-3">
            {/* Thumbnail */}
            <div className="shrink-0">
              <img
                src={URL.createObjectURL(photo.file)}
                alt={item.label}
                className="w-24 h-20 object-cover rounded-lg border border-border"
              />
            </div>

            {/* Analysis results */}
            {photo.analysis && (
              <div className="flex-1 min-w-0 space-y-2">
                {/* Score */}
                <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-semibold ${scoreBg(photo.analysis.qualityScore)} ${scoreColor(photo.analysis.qualityScore)}`}>
                  <Star className="w-3 h-3" />
                  {photo.analysis.qualityScore}/10 — {photo.analysis.qualityReason}
                </div>

                {/* Damage visible */}
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">What AI Sees</p>
                  <p className="text-xs text-foreground">{photo.analysis.damageVisible}</p>
                </div>

                {/* Adjuster description */}
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Adjuster Description</p>
                  <p className="text-xs text-foreground italic">"{photo.analysis.adjusterDescription}"</p>
                </div>

                {/* Framing suggestions */}
                {photo.analysis.framingSuggestions && photo.analysis.framingSuggestions !== "None needed" && (
                  <div className="bg-amber-950/30 border border-amber-800/40 rounded-lg p-2">
                    <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-wide mb-0.5 flex items-center gap-1">
                      <Lightbulb className="w-3 h-3" /> Improve This Photo
                    </p>
                    <p className="text-xs text-amber-200">{photo.analysis.framingSuggestions}</p>
                  </div>
                )}

                {/* Money impact */}
                <div className={`text-xs font-medium ${photo.analysis.isApprovalReady ? "text-green-400" : "text-amber-400"}`}>
                  {photo.analysis.isApprovalReady ? "✓ " : "⚠ "}{photo.analysis.moneyImpact}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Expanded instructions */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-border/30 pt-3 space-y-3">
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Why This Photo Matters</p>
            <p className="text-xs text-foreground">{item.whyItMatters}</p>
          </div>
          {item.tips.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Pro Tips</p>
              <ul className="space-y-1">
                {item.tips.map((tip, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <span className="text-primary mt-0.5">→</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PhotoChecklist() {
  const { data: checklistData, isLoading } = trpc.admin.getPhotoChecklist.useQuery();
  const analyzePhoto = trpc.admin.analyzePhoto.useMutation();

  const [photos, setPhotos] = useState<Record<string, UploadedPhoto>>({});
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [uploadingTo, setUploadingTo] = useState<string | null>(null);

  const checklist = checklistData?.checklist || [];
  const categories = checklistData?.categories || [];

  const requiredItems = checklist.filter((i) => i.required);
  const uploadedRequired = requiredItems.filter((i) => photos[i.id]);
  const approvalReadyCount = Object.values(photos).filter((p) => p.analysis?.isApprovalReady).length;
  const totalUploaded = Object.keys(photos).length;
  const completionPct = requiredItems.length > 0
    ? Math.round((uploadedRequired.length / requiredItems.length) * 100)
    : 0;

  const missingRequired = requiredItems.filter((i) => !photos[i.id]);

  async function handleUpload(itemId: string, file: File) {
    // Store locally for preview — in production this would upload to S3 first
    setPhotos((prev) => ({
      ...prev,
      [itemId]: { url: "", file, analysis: null, analyzing: false },
    }));
    toast.success("Photo added — click Analyze to get AI feedback");
  }

  async function handleAnalyze(itemId: string) {
    const photo = photos[itemId];
    if (!photo) return;

    setPhotos((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], analyzing: true },
    }));

    try {
      // Upload to get a URL first
      const formData = new FormData();
      formData.append("file", photo.file);

      // Use the built-in upload endpoint
      const uploadRes = await fetch("/api/upload-photo", {
        method: "POST",
        body: formData,
      });

      let photoUrl = "";
      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        photoUrl = uploadData.url;
      } else {
        // Fallback: convert to base64 data URL for analysis
        photoUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(photo.file);
        });
      }

      const analysis = await analyzePhoto.mutateAsync({
        photoUrl,
        checklistItemId: itemId,
      });

      setPhotos((prev) => ({
        ...prev,
        [itemId]: { ...prev[itemId], url: photoUrl, analysis, analyzing: false },
      }));

      if (analysis.isApprovalReady) {
        toast.success(`✓ ${checklist.find((i) => i.id === itemId)?.label} — Adjuster Ready!`);
      } else {
        toast.warning(`Score ${analysis.qualityScore}/10 — See suggestions to improve`);
      }
    } catch (err: any) {
      setPhotos((prev) => ({
        ...prev,
        [itemId]: { ...prev[itemId], analyzing: false },
      }));
      toast.error("Analysis failed — check your connection and try again");
    }
  }

  function handleRemove(itemId: string) {
    setPhotos((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  }

  const displayCategories = activeCategory ? [activeCategory] : categories;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-24 gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading photo checklist...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Camera className="w-6 h-6 text-primary" />
            Photo Checklist
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Every photo you skip is money you leave on the table. Upload and let AI score each one.
          </p>
        </div>

        {/* Warning banner */}
        {missingRequired.length > 0 && (
          <div className="rounded-xl border border-red-800 bg-red-950/30 p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-300">
                ⚠ You are missing {missingRequired.length} required photo{missingRequired.length !== 1 ? "s" : ""} — this will cost you money.
              </p>
              <p className="text-xs text-red-400 mt-0.5">
                Missing: {missingRequired.slice(0, 3).map((i) => i.label).join(", ")}{missingRequired.length > 3 ? ` and ${missingRequired.length - 3} more` : ""}
              </p>
            </div>
          </div>
        )}

        {/* Progress summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Required Photos", value: `${uploadedRequired.length}/${requiredItems.length}`, color: completionPct === 100 ? "text-green-400" : "text-amber-400" },
            { label: "Total Uploaded", value: totalUploaded, color: "text-foreground" },
            { label: "AI Approved", value: approvalReadyCount, color: "text-green-400" },
            { label: "Completion", value: `${completionPct}%`, color: completionPct === 100 ? "text-green-400" : "text-primary" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-4 pb-3">
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="w-full">
          <Progress value={completionPct} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">{completionPct}% of required photos uploaded</p>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={activeCategory === null ? "default" : "outline"}
            className="text-xs h-7"
            onClick={() => setActiveCategory(null)}
          >
            All Categories
          </Button>
          {categories.map((cat) => {
            const catItems = checklist.filter((i) => i.category === cat);
            const catUploaded = catItems.filter((i) => photos[i.id]).length;
            const catRequired = catItems.filter((i) => i.required).length;
            const catMissingRequired = catItems.filter((i) => i.required && !photos[i.id]).length;
            return (
              <Button
                key={cat}
                size="sm"
                variant={activeCategory === cat ? "default" : "outline"}
                className={`text-xs h-7 flex items-center gap-1.5 ${catMissingRequired > 0 ? "border-red-800 text-red-300" : ""}`}
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              >
                {cat}
                {catMissingRequired > 0 && (
                  <span className="bg-red-800 text-red-200 rounded-full px-1 text-[9px] font-bold">{catMissingRequired}</span>
                )}
                {catMissingRequired === 0 && catUploaded > 0 && (
                  <CheckCircle2 className="w-3 h-3 text-green-400" />
                )}
              </Button>
            );
          })}
        </div>

        {/* Photo slots by category */}
        {displayCategories.map((category) => {
          const categoryItems = checklist.filter((i) => i.category === category);
          if (categoryItems.length === 0) return null;

          const catMissingRequired = categoryItems.filter((i) => i.required && !photos[i.id]).length;
          const catMoneyAtRisk = categoryItems
            .filter((i) => i.moneyAtRisk && !photos[i.id])
            .map((i) => i.moneyAtRisk!)
            .join(", ");

          return (
            <div key={category} className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-foreground">{category}</h2>
                  {catMissingRequired > 0 && (
                    <p className="text-xs text-red-400 flex items-center gap-1 mt-0.5">
                      <AlertTriangle className="w-3 h-3" />
                      {catMissingRequired} required photo{catMissingRequired !== 1 ? "s" : ""} missing — you are leaving money on the table
                    </p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {categoryItems.filter((i) => photos[i.id]).length}/{categoryItems.length} uploaded
                </p>
              </div>

              <div className="space-y-2">
                {categoryItems.map((item) => (
                  <PhotoSlot
                    key={item.id}
                    item={item}
                    photo={photos[item.id] || null}
                    onUpload={(file) => handleUpload(item.id, file)}
                    onAnalyze={() => handleAnalyze(item.id)}
                    onRemove={() => handleRemove(item.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* Bottom CTA */}
        {totalUploaded > 0 && (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 flex items-start gap-4">
            <Zap className="w-6 h-6 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">
                {approvalReadyCount} photo{approvalReadyCount !== 1 ? "s" : ""} are adjuster-ready
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {completionPct < 100
                  ? `Upload the remaining ${missingRequired.length} required photos to maximize your supplement.`
                  : "All required photos are uploaded. Your documentation package is complete."}
              </p>
              {completionPct === 100 && (
                <Button size="sm" className="mt-3 flex items-center gap-1.5" onClick={() => window.location.href = "/jobs/new"}>
                  Start Your Supplement <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
