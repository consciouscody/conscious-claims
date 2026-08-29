import { useState, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Upload, Camera, CheckCircle, AlertTriangle, XCircle, Loader2, Info } from "lucide-react";
import { toast } from "sonner";

interface IdentificationResult {
  identified: boolean;
  confidence?: "HIGH" | "MEDIUM" | "LOW";
  manufacturer?: string;
  series_name?: string;
  color?: string;
  production_status?: "CURRENT" | "DISCONTINUED";
  type?: string;
  dimensions?: string;
  visual_features_matched?: string[];
  reasoning?: string;
  insurance_implications?: string;
  alternative_matches?: Array<{ manufacturer: string; series: string; confidence: string; reason?: string }>;
}

export default function ShingleIdentifier() {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<IdentificationResult | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const identify = trpc.shingle.identify.useMutation({
    onSuccess: (data) => {
      setResult(data as IdentificationResult);
    },
    onError: (err) => {
      toast.error("Identification failed: " + err.message);
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewUrl(ev.target?.result as string);
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setPhotoUrl(data.url);
      toast.success("Photo uploaded — running AI identification...");
      identify.mutate({ photoUrl: data.url });
    } catch (err: any) {
      toast.error("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const confidenceColor = (c?: string) => {
    if (c === "HIGH") return "bg-green-500/20 text-green-400 border-green-500/30";
    if (c === "MEDIUM") return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    return "bg-red-500/20 text-red-400 border-red-500/30";
  };

  const statusColor = (s?: string) =>
    s === "CURRENT"
      ? "bg-green-500/20 text-green-400 border-green-500/30"
      : "bg-red-500/20 text-red-400 border-red-500/30";

  const isLoading = uploading || identify.isPending;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 pt-8 pb-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Shingle Identifier</h1>
          <p className="text-muted-foreground mt-1">
            Upload a photo of a shingle. The app names the manufacturer, series, and color, and says if that product is discontinued. Discontinued plus storm damage is a strong full-roof fight. Carriers still want proof.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upload Panel */}
          <div className="flex flex-col gap-4">
            <Card className="border-border bg-card">
              <CardContent className="pt-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {previewUrl ? (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Shingle preview"
                      className="w-full rounded-lg object-contain max-h-72 bg-black/20"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2 bg-background/80"
                      onClick={() => {
                        setPreviewUrl(null);
                        setPhotoUrl(null);
                        setResult(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                    >
                      Change Photo
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-border rounded-lg p-10 flex flex-col items-center gap-3 hover:border-primary/60 hover:bg-primary/5 transition-colors cursor-pointer"
                  >
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <Camera className="w-7 h-7 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-foreground">Upload Shingle Photo</p>
                      <p className="text-sm text-muted-foreground mt-1">JPEG, PNG, WEBP — up to 20MB</p>
                    </div>
                    <Button size="sm" className="mt-1">
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Photo
                    </Button>
                  </button>
                )}

                {isLoading && (
                  <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    {uploading ? "Uploading photo..." : "AI analyzing shingle..."}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="border-border bg-card">
              <CardContent className="pt-4 pb-4">
                <div className="flex gap-2 items-start">
                  <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Photo Tips for Best Results</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Show the full shingle face including the nailing zone</li>
                      <li>• Capture the tab pattern and shadow line clearly</li>
                      <li>• Good lighting — avoid glare or deep shadows</li>
                      <li>• Close-up shots work better than wide roof shots</li>
                      <li>• Look for nailing line colors (white = GAF, blue = CertainTeed, orange = TAMKO)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div>
            {!result && !isLoading && (
              <Card className="border-border bg-card h-full">
                <CardContent className="pt-6 flex flex-col items-center justify-center h-full min-h-64 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Camera className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="font-medium text-foreground">Results will appear here</p>
                  <p className="text-sm text-muted-foreground mt-1">Upload a shingle photo to begin identification</p>
                </CardContent>
              </Card>
            )}

            {isLoading && (
              <Card className="border-border bg-card h-full">
                <CardContent className="pt-6 flex flex-col items-center justify-center h-full min-h-64 text-center">
                  <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                  <p className="font-medium text-foreground">Analyzing shingle...</p>
                  <p className="text-sm text-muted-foreground mt-1">Cross-referencing 192 products across 9 manufacturers</p>
                </CardContent>
              </Card>
            )}

            {result && !isLoading && (
              <div className="flex flex-col gap-4">
                {/* Main Result Card */}
                <Card className={`border ${result.identified ? (result.production_status === "DISCONTINUED" ? "border-red-500/40 bg-red-950/20" : "border-green-500/40 bg-green-950/20") : "border-border bg-card"}`}>
                  <CardContent className="pt-5">
                    <div className="flex items-start gap-3 mb-4">
                      {result.identified ? (
                        result.production_status === "DISCONTINUED" ? (
                          <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircle className="w-6 h-6 text-green-400 shrink-0 mt-0.5" />
                        )
                      ) : (
                        <XCircle className="w-6 h-6 text-muted-foreground shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        {result.identified ? (
                          <>
                            <p className="text-lg font-bold text-foreground">{result.manufacturer} {result.series_name}</p>
                            <p className="text-sm text-muted-foreground">{result.color} · {result.type}</p>
                          </>
                        ) : (
                          <p className="text-base font-semibold text-foreground">Could not identify shingle</p>
                        )}
                      </div>
                    </div>

                    {result.identified && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="outline" className={confidenceColor(result.confidence)}>
                          {result.confidence} Confidence
                        </Badge>
                        <Badge variant="outline" className={statusColor(result.production_status)}>
                          {result.production_status}
                        </Badge>
                        {result.dimensions && (
                          <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-border">
                            {result.dimensions}
                          </Badge>
                        )}
                      </div>
                    )}

                    {result.visual_features_matched && result.visual_features_matched.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Visual Features Matched</p>
                        <div className="flex flex-wrap gap-1.5">
                          {result.visual_features_matched.map((f, i) => (
                            <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">{f}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {result.reasoning && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">AI Reasoning</p>
                        <p className="text-sm text-foreground/80 leading-relaxed">{result.reasoning}</p>
                      </div>
                    )}

                    {result.insurance_implications && (
                      <div className={`rounded-lg p-3 ${result.production_status === "DISCONTINUED" ? "bg-red-500/10 border border-red-500/20" : "bg-green-500/10 border border-green-500/20"}`}>
                        <p className="text-xs font-semibold uppercase tracking-wide mb-1 ${result.production_status === 'DISCONTINUED' ? 'text-red-400' : 'text-green-400'}">
                          Insurance Implications
                        </p>
                        <p className="text-sm text-foreground/80">{result.insurance_implications}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Alternative Matches */}
                {result.alternative_matches && result.alternative_matches.length > 0 && (
                  <Card className="border-border bg-card">
                    <CardContent className="pt-4 pb-4">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Alternative Matches Considered</p>
                      <div className="flex flex-col gap-2">
                        {result.alternative_matches.map((alt, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <span className="text-foreground/70">{alt.manufacturer} {alt.series}</span>
                            <Badge variant="outline" className="text-xs bg-muted/30 text-muted-foreground border-border">
                              {alt.confidence}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Re-analyze button */}
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Analyze Another Shingle
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Database Stats */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Products", value: "192" },
            { label: "Current Products", value: "95" },
            { label: "Discontinued", value: "97" },
            { label: "Manufacturers", value: "9" },
          ].map((stat) => (
            <Card key={stat.label} className="border-border bg-card">
              <CardContent className="pt-4 pb-4 text-center">
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
