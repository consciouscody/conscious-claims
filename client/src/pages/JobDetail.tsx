import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  Upload,
  Camera,
  FileText,
  Mail,
  DollarSign,
  Loader2,
  CheckCircle,
  XCircle,
  Trash2,
  Sparkles,
  Copy,
  Send,
  Plus,
  Eye,
  AlertCircle,
} from "lucide-react";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";
import { useState, useRef } from "react";
import { Streamdown } from "streamdown";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-700 border-gray-200" },
  estimate_uploaded: { label: "Estimate Uploaded", color: "bg-blue-100 text-blue-700 border-blue-200" },
  supplement_generated: { label: "Supplement Ready", color: "bg-purple-100 text-purple-700 border-purple-200" },
  email_drafted: { label: "Email Drafted", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  submitted: { label: "Submitted", color: "bg-amber-100 text-amber-700 border-amber-200" },
  approved: { label: "Approved", color: "bg-green-100 text-green-700 border-green-200" },
  denied: { label: "Denied", color: "bg-red-100 text-red-700 border-red-200" },
  paid: { label: "Paid", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
};

function formatCurrency(val: string | number | null | undefined) {
  if (!val) return "$0";
  const num = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(num)) return "$0";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num);
}

export default function JobDetail() {
  return (
    <DashboardLayout>
      <JobDetailContent />
    </DashboardLayout>
  );
}

function JobDetailContent() {
  const params = useParams<{ id: string }>();
  const jobId = parseInt(params.id || "0");
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  const { data: job, isLoading } = trpc.jobs.get.useQuery({ id: jobId });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-24">
        <p className="text-muted-foreground">Job not found.</p>
        <Button variant="link" onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[job.status] || STATUS_CONFIG.draft;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={`text-xs border ${statusCfg.color}`} variant="outline">
            {statusCfg.label}
          </Badge>
          <StatusUpdater jobId={jobId} currentStatus={job.status} />
        </div>
      </div>

      <div>
        <h1 className="text-xl font-bold text-foreground">{job.propertyAddress}</h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1 flex-wrap">
          {job.homeownerName && <span>{job.homeownerName}</span>}
          {job.claimNumber && <span>· Claim #{job.claimNumber}</span>}
          {job.insuranceCarrier && <span>· {job.insuranceCarrier}</span>}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="estimate">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="estimate" className="text-xs">
            <FileText className="w-3.5 h-3.5 mr-1.5" />
            Estimate
          </TabsTrigger>
          <TabsTrigger value="photos" className="text-xs">
            <Camera className="w-3.5 h-3.5 mr-1.5" />
            Photos
          </TabsTrigger>
          <TabsTrigger value="supplement" className="text-xs">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Supplement
          </TabsTrigger>
          <TabsTrigger value="email" className="text-xs">
            <Mail className="w-3.5 h-3.5 mr-1.5" />
            Email
          </TabsTrigger>
          <TabsTrigger value="payment" className="text-xs">
            <DollarSign className="w-3.5 h-3.5 mr-1.5" />
            Payment
          </TabsTrigger>
        </TabsList>

        <TabsContent value="estimate" className="mt-4">
          <EstimateTab job={job} jobId={jobId} />
        </TabsContent>
        <TabsContent value="photos" className="mt-4">
          <PhotosTab jobId={jobId} />
        </TabsContent>
        <TabsContent value="supplement" className="mt-4">
          <SupplementTab job={job} jobId={jobId} />
        </TabsContent>
        <TabsContent value="email" className="mt-4">
          <EmailTab job={job} jobId={jobId} />
        </TabsContent>
        <TabsContent value="payment" className="mt-4">
          <PaymentTab job={job} jobId={jobId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Status Updater ──────────────────────────────────────────────────────────

function StatusUpdater({ jobId, currentStatus }: { jobId: number; currentStatus: string }) {
  const utils = trpc.useUtils();
  const updateStatus = trpc.jobs.updateStatus.useMutation({
    onSuccess: () => {
      utils.jobs.get.invalidate({ id: jobId });
      utils.jobs.list.invalidate();
      toast.success("Status updated");
    },
  });

  const statuses = [
    "draft", "estimate_uploaded", "supplement_generated",
    "email_drafted", "submitted", "approved", "denied", "paid"
  ];

  return (
    <Select
      value={currentStatus}
      onValueChange={(val) => updateStatus.mutate({ id: jobId, status: val as any })}
    >
      <SelectTrigger className="w-44 h-8 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {statuses.map((s) => (
          <SelectItem key={s} value={s} className="text-xs">
            {STATUS_CONFIG[s]?.label || s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ─── Estimate Tab ────────────────────────────────────────────────────────────

function EstimateTab({ job, jobId }: { job: any; jobId: number }) {
  const utils = trpc.useUtils();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const parsePdf = trpc.pdf.parseFromUrl.useMutation({
    onSuccess: (data) => {
      utils.jobs.get.invalidate({ id: jobId });
      utils.supplement.getByJob.invalidate({ jobId });
      toast.success(`Estimate parsed — ${data.missingItemsDetected} supplement items detected`);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      await parsePdf.mutateAsync({ pdfUrl: url, jobId });
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const parsedItems = (job.parsedLineItems as any[]) || [];

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Upload Xactimate Estimate</CardTitle>
          <CardDescription className="text-xs">
            Upload the original insurance estimate PDF. We will parse every line item and detect what is missing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />
          {job.originalEstimateUrl ? (
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-800">Estimate uploaded and parsed</p>
                {job.originalEstimateAmount && (
                  <p className="text-xs text-green-700">Original amount: {formatCurrency(job.originalEstimateAmount)}</p>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                Replace
              </Button>
            </div>
          ) : (
            <div
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              {uploading || parsePdf.isPending ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">
                    {uploading ? "Uploading..." : "Parsing estimate..."}
                  </p>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="font-medium text-foreground mb-1">Click to upload Xactimate PDF</p>
                  <p className="text-xs text-muted-foreground">PDF files up to 20MB</p>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Parsed Line Items */}
      {parsedItems.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Parsed Line Items ({parsedItems.length})</CardTitle>
            <CardDescription className="text-xs">
              These items were found in the original estimate. Missing items are shown in the Supplement tab.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border max-h-80 overflow-y-auto">
              {parsedItems.map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                  <span className="font-mono text-xs text-muted-foreground w-28 shrink-0">{item.code}</span>
                  <span className="flex-1 text-foreground truncate">{item.description}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{item.quantity} {item.unit}</span>
                  {item.totalPrice && (
                    <span className="text-xs font-medium text-foreground shrink-0">${item.totalPrice}</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Photos Tab ──────────────────────────────────────────────────────────────

function PhotosTab({ jobId }: { jobId: number }) {
  const utils = trpc.useUtils();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<number | null>(null);

  const { data: photos } = trpc.photos.list.useQuery({ jobId });
  const savePhoto = trpc.photos.save.useMutation({
    onSuccess: () => utils.photos.list.invalidate({ jobId }),
  });
  const analyzePhoto = trpc.photos.analyzeWithAI.useMutation({
    onSuccess: () => {
      utils.photos.list.invalidate({ jobId });
      setAnalyzingId(null);
      toast.success("Photo analyzed");
    },
    onError: () => setAnalyzingId(null),
  });
  const deletePhoto = trpc.photos.delete.useMutation({
    onSuccess: () => utils.photos.list.invalidate({ jobId }),
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) throw new Error("Upload failed");
        const { url, fileKey, filename } = await res.json();
        await savePhoto.mutateAsync({ jobId, url, fileKey, filename });
      }
      toast.success(`${files.length} photo(s) uploaded`);
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Roof Photos</CardTitle>
              <CardDescription className="text-xs mt-1">
                Upload photos for AI analysis. Our AI will identify supplement evidence in each photo.
              </CardDescription>
            </div>
            <Button size="sm" onClick={() => fileRef.current?.click()} disabled={uploading} className="gap-2">
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Add Photos
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />

          {!photos || photos.length === 0 ? (
            <div
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium text-foreground mb-1">Upload roof photos</p>
              <p className="text-xs text-muted-foreground">JPEG, PNG, WEBP — multiple files supported</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {photos.map((photo) => (
                <div key={photo.id} className="relative group rounded-lg overflow-hidden border border-border bg-muted">
                  <img
                    src={photo.url}
                    alt={photo.filename || "Roof photo"}
                    className="w-full h-36 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-7 text-xs gap-1"
                      onClick={() => {
                        setAnalyzingId(photo.id);
                        analyzePhoto.mutate({ photoId: photo.id, photoUrl: photo.url, jobId });
                      }}
                      disabled={analyzingId === photo.id}
                    >
                      {analyzingId === photo.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}
                      Analyze
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-7 text-xs"
                      onClick={() => deletePhoto.mutate({ photoId: photo.id })}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  {photo.aiAnalysis && (
                    <div className="absolute top-1.5 right-1.5">
                      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  )}
                  {photo.label && (
                    <div className="p-2 text-xs text-muted-foreground truncate">{photo.label}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Analysis Results */}
      {photos && photos.some((p) => p.aiAnalysis) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              AI Photo Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {photos
              .filter((p) => p.aiAnalysis)
              .map((photo) => (
                <div key={photo.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <img src={photo.url} alt="" className="w-12 h-12 rounded object-cover" />
                    <span className="text-sm font-medium text-foreground">{photo.filename || "Photo"}</span>
                  </div>
                  <div className="text-sm text-foreground prose prose-sm max-w-none">
                    <Streamdown>{photo.aiAnalysis || ""}</Streamdown>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Supplement Tab ──────────────────────────────────────────────────────────

function SupplementTab({ job, jobId }: { job: any; jobId: number }) {
  const utils = trpc.useUtils();
  const { data: items, isLoading } = trpc.supplement.getByJob.useQuery({ jobId });
  const { data: totals } = trpc.supplement.calculateTotal.useQuery({ jobId });
  const updateItem = trpc.supplement.update.useMutation({
    onSuccess: () => {
      utils.supplement.getByJob.invalidate({ jobId });
      utils.supplement.calculateTotal.invalidate({ jobId });
    },
  });
  const updateJob = trpc.jobs.update.useMutation({
    onSuccess: () => utils.jobs.get.invalidate({ id: jobId }),
  });
  const generatePdf = trpc.supplement.generatePdfReport.useMutation();

  const handleToggleItem = (id: number, currentIncluded: string) => {
    updateItem.mutate({ id, isIncluded: currentIncluded === "yes" ? "no" : "yes" });
  };

  const handleSaveSupplementAmount = () => {
    if (totals?.total) {
      updateJob.mutate({ id: jobId, supplementAmount: totals.total });
      toast.success("Supplement amount saved");
    }
  };

  const handleExportPdf = async () => {
    const data = await generatePdf.mutateAsync({ jobId });
    // Build a printable HTML page and open it
    const rows = data.items.map((item: any) => `
      <tr>
        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-family:monospace;font-size:12px;color:#6b7280">${item.xactimateCode || ''}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:13px">${item.description || ''}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-align:center;font-size:12px">${item.quantity || '—'} ${item.unit || ''}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:12px">$${parseFloat(item.unitPrice || '0').toFixed(2)}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;font-size:13px">$${parseFloat(item.totalPrice || '0').toFixed(2)}</td>
      </tr>
      ${item.justification ? `<tr><td colspan="5" style="padding:2px 8px 8px 8px;font-size:11px;color:#6b7280;border-bottom:1px solid #f3f4f6"><em>Justification: ${item.justification}</em></td></tr>` : ''}
      ${item.codeReference ? `<tr><td colspan="5" style="padding:2px 8px 8px 8px;font-size:11px;color:#2563eb;border-bottom:1px solid #f3f4f6">Code Reference: ${item.codeReference}</td></tr>` : ''}
    `).join('');

    const html = `<!DOCTYPE html><html><head><title>Supplement Report — ${job.propertyAddress}</title>
    <style>
      *{box-sizing:border-box}
      body{font-family:Arial,sans-serif;color:#111;margin:0;padding:0;background:#fff}
      @media print{.no-print{display:none!important}}
      .brand-header{background:#0d1b3e;color:#fff;padding:14px 28px;display:flex;align-items:center;justify-content:space-between}
      .brand-name{font-size:20px;font-weight:800;letter-spacing:0.3px}
      .brand-accent{color:#f97316}
      .brand-sub{font-size:10px;color:#93c5fd;text-transform:uppercase;letter-spacing:1.5px;margin-top:3px}
      .brand-right{text-align:right;font-size:11px;color:#93c5fd;line-height:1.6}
      .doc-body{padding:24px 28px}
      .doc-title-row{display:flex;align-items:flex-start;justify-content:space-between;border-bottom:3px solid #0d1b3e;padding-bottom:14px;margin-bottom:18px}
      .doc-title{font-size:21px;font-weight:700;color:#0d1b3e;margin:0}
      .doc-subtitle{font-size:13px;color:#6b7280;margin:4px 0 0}
      .doc-date{text-align:right;font-size:12px;color:#6b7280}
      .doc-date strong{color:#0d1b3e;display:block;font-size:13px}
      .brand-footer{background:#f8f9fa;border-top:2px solid #0d1b3e;padding:12px 28px;display:flex;align-items:center;justify-content:space-between;margin-top:28px}
      .footer-left{font-size:11px;color:#6b7280}
      .footer-right{font-size:11px;color:#6b7280;text-align:right}
      .footer-brand{font-weight:700;color:#0d1b3e;font-size:12px}
    </style></head><body>
    <div class="brand-header">
      <div>
        <div class="brand-name"><span class="brand-accent">⚡</span> SupplementAI</div>
        <div class="brand-sub">by Conscious Capital</div>
      </div>
      <div class="brand-right">
        consconscioussupplements.com<br/>
        AI-Powered Insurance Supplement Generation
      </div>
    </div>
    <div class="doc-body">
    <div class="doc-title-row">
      <div>
        <h1 class="doc-title">Insurance Supplement Report</h1>
        <p class="doc-subtitle">${job.propertyAddress || 'Property Address'}${job.claimNumber ? ' &nbsp;·&nbsp; Claim #' + job.claimNumber : ''}</p>
      </div>
      <div class="doc-date">
        <strong>${new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}</strong>
        Prepared by Cody · Conscious Capital
      </div>
    </div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:8px">
      <tr style="background:#f8f9fa">
        <td style="padding:4px 8px;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase">Code</td>
        <td style="padding:4px 8px;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase">Description</td>
        <td style="padding:4px 8px;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;text-align:center">Qty</td>
        <td style="padding:4px 8px;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;text-align:right">Unit Price</td>
        <td style="padding:4px 8px;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;text-align:right">Total</td>
      </tr>
      ${rows}
    </table>
    <div style="text-align:right;padding:12px 8px;border-top:2px solid #0d1b3e;margin-top:8px">
      <span style="font-size:18px;font-weight:700;color:#0d1b3e">Total Supplement: $${parseFloat(data.total).toLocaleString('en-US', {minimumFractionDigits:2})}</span>
    </div>
    </div>
    <div class="brand-footer">
      <div class="footer-left">
        <div class="footer-brand">⚡ SupplementAI by Conscious Capital</div>
        <div>consconscioussupplements.com &nbsp;·&nbsp; AI-Powered Supplement Generation</div>
      </div>
      <div class="footer-right">
        <strong>Property:</strong> ${job.propertyAddress || '—'}<br/>
        <strong>Carrier:</strong> ${job.insuranceCarrier || '—'} &nbsp;·&nbsp; <strong>Adjuster:</strong> ${job.adjusterName || '—'}
      </div>
    </div>
    <script>window.onload = () => window.print();</script>
    </body></html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (!win) toast.error('Please allow popups to export the PDF');
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;
  }

  const included = items?.filter((i) => i.isIncluded === "yes") || [];
  const excluded = items?.filter((i) => i.isIncluded === "no") || [];

  return (
    <div className="space-y-4">
      {/* Summary */}
      {items && items.length > 0 && (
        <Card className="border-purple-200 bg-purple-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-sm font-semibold text-purple-900">
                  {included.length} supplement items · Estimated value: {formatCurrency(totals?.total)}
                </p>
                <p className="text-xs text-purple-700 mt-0.5">
                  Review each item below and toggle off any that do not apply.
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleExportPdf} disabled={generatePdf.isPending} className="gap-2">
                  {generatePdf.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                  Export Report
                </Button>
                <Button size="sm" onClick={handleSaveSupplementAmount} className="gap-2">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Save Total ({formatCurrency(totals?.total)})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!items || items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-medium text-foreground mb-1">No supplement items yet</p>
            <p className="text-sm text-muted-foreground">
              Upload an Xactimate estimate in the Estimate tab to automatically detect missing items.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Included Items */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Supplement Line Items ({included.length})
              </CardTitle>
              <CardDescription className="text-xs">
                Toggle items off if they do not apply to this job. Click a row to edit quantity and price.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {included.map((item) => (
                  <SupplementItemRow
                    key={item.id}
                    item={item}
                    onToggle={() => handleToggleItem(item.id, item.isIncluded || "yes")}
                    onUpdate={(data) => updateItem.mutate({ id: item.id, ...data })}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Excluded Items */}
          {excluded.length > 0 && (
            <Card className="opacity-60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground">Excluded Items ({excluded.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {excluded.map((item) => (
                    <SupplementItemRow
                      key={item.id}
                      item={item}
                      onToggle={() => handleToggleItem(item.id, item.isIncluded || "no")}
                      onUpdate={(data) => updateItem.mutate({ id: item.id, ...data })}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function SupplementItemRow({ item, onToggle, onUpdate }: {
  item: any;
  onToggle: () => void;
  onUpdate: (data: any) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [qty, setQty] = useState(item.quantity || "");
  const [price, setPrice] = useState(item.unitPrice || "");
  const included = item.isIncluded === "yes";

  const handleSave = () => {
    const total = qty && price ? (parseFloat(qty) * parseFloat(price)).toFixed(2) : undefined;
    onUpdate({ quantity: qty, unitPrice: price, totalPrice: total });
    setExpanded(false);
    toast.success("Item updated");
  };

  return (
    <div className={`px-4 py-3 ${!included ? "opacity-50" : ""}`}>
      <div className="flex items-start gap-3">
        <button
          onClick={onToggle}
          className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
            included ? "bg-primary border-primary" : "border-border"
          }`}
        >
          {included && <CheckCircle className="w-3 h-3 text-white" />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-muted-foreground">{item.xactimateCode}</span>
            <span className="text-sm font-medium text-foreground">{item.description}</span>
            <Badge variant="outline" className="text-xs h-4 px-1.5">
              {item.source === "auto_detected" ? "Auto" : item.source === "ai_photo" ? "AI Photo" : "Manual"}
            </Badge>
          </div>
          {item.justification && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.justification}</p>
          )}
          {item.codeReference && (
            <p className="text-xs text-blue-600 mt-0.5">📋 {item.codeReference}</p>
          )}
        </div>
        <div className="text-right shrink-0">
          {item.totalPrice ? (
            <p className="text-sm font-semibold text-foreground">{formatCurrency(item.totalPrice)}</p>
          ) : (
            <p className="text-xs text-muted-foreground">{item.quantity || "—"} {item.unit}</p>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-primary hover:underline mt-0.5"
          >
            {expanded ? "Close" : "Edit"}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 pl-8 grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Quantity</Label>
            <Input value={qty} onChange={(e) => setQty(e.target.value)} className="h-7 text-xs" placeholder="e.g. 120" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Unit Price ($)</Label>
            <Input value={price} onChange={(e) => setPrice(e.target.value)} className="h-7 text-xs" placeholder="e.g. 3.15" />
          </div>
          <div className="flex items-end">
            <Button size="sm" onClick={handleSave} className="h-7 text-xs w-full">Save</Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Email Tab ───────────────────────────────────────────────────────────────

function EmailTab({ job, jobId }: { job: any; jobId: number }) {
  const utils = trpc.useUtils();
  const { data: emails } = trpc.emails.list.useQuery({ jobId });
  const { data: supplementItems } = trpc.supplement.getByJob.useQuery({ jobId });
  const [additionalContext, setAdditionalContext] = useState("");
  const [emailType, setEmailType] = useState<"supplement_request" | "reinspection_request" | "follow_up">("supplement_request");
  const [editingEmail, setEditingEmail] = useState<{ id: number; subject: string; body: string } | null>(null);

  const generateEmail = trpc.emails.generate.useMutation({
    onSuccess: () => {
      utils.emails.list.invalidate({ jobId });
      utils.jobs.get.invalidate({ id: jobId });
      toast.success("Email generated");
    },
    onError: (err) => toast.error(err.message),
  });

  const updateEmail = trpc.emails.update.useMutation({
    onSuccess: () => {
      utils.emails.list.invalidate({ jobId });
      setEditingEmail(null);
      toast.success("Email saved");
    },
  });

  const markSent = trpc.emails.markSent.useMutation({
    onSuccess: () => {
      utils.emails.list.invalidate({ jobId });
      toast.success("Email marked as sent");
    },
  });

  const includedItems = supplementItems?.filter((i) => i.isIncluded === "yes") || [];

  const handleGenerate = () => {
    if (includedItems.length === 0) {
      toast.error("No supplement items selected. Go to the Supplement tab first.");
      return;
    }
    generateEmail.mutate({
      jobId,
      claimNumber: job.claimNumber,
      propertyAddress: job.propertyAddress,
      adjusterName: job.adjusterName,
      insuranceCarrier: job.insuranceCarrier,
      supplementItems: includedItems.map((i) => ({
        xactimateCode: i.xactimateCode,
        description: i.description,
        justification: i.justification || undefined,
        codeReference: i.codeReference || undefined,
        quantity: i.quantity || undefined,
        unit: i.unit,
        totalPrice: i.totalPrice || undefined,
      })),
      emailType,
      additionalContext: additionalContext || undefined,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="space-y-4">
      {/* Generate */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Generate Adjuster Email</CardTitle>
          <CardDescription className="text-xs">
            AI will write a professional supplement request email using your claim details and supplement items.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Email Type</Label>
              <Select value={emailType} onValueChange={(v) => setEmailType(v as any)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="supplement_request" className="text-xs">Supplement Request</SelectItem>
                  <SelectItem value="reinspection_request" className="text-xs">Reinspection Request</SelectItem>
                  <SelectItem value="follow_up" className="text-xs">Follow-Up</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Items to Include</Label>
              <div className="h-8 flex items-center text-xs text-muted-foreground">
                {includedItems.length} supplement items selected
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Additional Context (optional)</Label>
            <Textarea
              placeholder="e.g. Adjuster previously denied starter shingles — include extra justification. Multiple layers present on front slope."
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              rows={2}
              className="text-xs"
            />
          </div>
          <Button onClick={handleGenerate} disabled={generateEmail.isPending} className="gap-2">
            {generateEmail.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Generate Email
          </Button>
        </CardContent>
      </Card>

      {/* Email List */}
      {emails && emails.length > 0 && (
        <div className="space-y-4">
          {emails.map((email) => (
            <Card key={email.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-sm">{email.subject}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs h-4 px-1.5">
                        {email.emailType?.replace("_", " ")}
                      </Badge>
                      {email.sentAt && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Sent
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1"
                      onClick={() => copyToClipboard(`Subject: ${email.subject}\n\n${email.body}`)}
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </Button>
                    {!email.sentAt && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1"
                        onClick={() => markSent.mutate({ id: email.id })}
                      >
                        <Send className="w-3 h-3" />
                        Mark Sent
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() => setEditingEmail({ id: email.id, subject: email.subject || "", body: email.body || "" })}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {editingEmail?.id === email.id ? (
                  <div className="space-y-3">
                    <Input
                      value={editingEmail.subject}
                      onChange={(e) => setEditingEmail({ ...editingEmail, subject: e.target.value })}
                      className="text-sm"
                    />
                    <Textarea
                      value={editingEmail.body}
                      onChange={(e) => setEditingEmail({ ...editingEmail, body: e.target.value })}
                      rows={12}
                      className="text-sm font-mono"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => updateEmail.mutate({ id: email.id, subject: editingEmail.subject, body: editingEmail.body })}>
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingEmail(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-muted/40 rounded-lg p-4 text-sm whitespace-pre-wrap font-mono text-foreground max-h-80 overflow-y-auto">
                    {email.body}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Payment Tab ─────────────────────────────────────────────────────────────

function PaymentTab({ job, jobId }: { job: any; jobId: number }) {
  const utils = trpc.useUtils();
  const [recoveredAmount, setRecoveredAmount] = useState(String(job.recoveredAmount || ""));
  const [feePercentage, setFeePercentage] = useState(String(job.feePercentage || "12"));
  const [contractorEmail, setContractorEmail] = useState(job.adjusterEmail || "");
  const [contractorName, setContractorName] = useState(job.homeownerName || "");

  const { data: calc } = trpc.calculator.calculate.useQuery(
    {
      supplementAmount: parseFloat(recoveredAmount) || 0,
      feePercentage: parseFloat(feePercentage) || 12,
    },
    { enabled: !!recoveredAmount && parseFloat(recoveredAmount) > 0 }
  );

  const { data: paymentStatus, refetch: refetchPayment } = trpc.stripe.getPaymentStatus.useQuery(
    { jobId },
    { refetchInterval: job.paymentStatus !== "paid" ? 10000 : false }
  );

  const updateJob = trpc.jobs.update.useMutation({
    onSuccess: () => {
      utils.jobs.get.invalidate({ id: jobId });
      utils.jobs.stats.invalidate();
      refetchPayment();
      toast.success("Payment info saved");
    },
  });

  const createCheckout = trpc.stripe.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.info("Redirecting to Stripe checkout...");
        window.open(data.url, "_blank");
      }
    },
    onError: (err) => toast.error(err.message),
  });

  const sendInvoice = trpc.stripe.sendInvoice.useMutation({
    onSuccess: (data) => {
      utils.jobs.get.invalidate({ id: jobId });
      refetchPayment();
      toast.success("Invoice sent to contractor via email!");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSave = () => {
    updateJob.mutate({ id: jobId, recoveredAmount, feePercentage });
  };

  const handlePayNow = () => {
    if (!job.feeAmount || Number(job.feeAmount) <= 0) {
      toast.error("Save payment info first to set the fee amount.");
      return;
    }
    createCheckout.mutate({ jobId, origin: window.location.origin });
  };

  const handleSendInvoice = () => {
    if (!contractorEmail) {
      toast.error("Enter the contractor's email address.");
      return;
    }
    if (!job.feeAmount || Number(job.feeAmount) <= 0) {
      toast.error("Save payment info first to set the fee amount.");
      return;
    }
    sendInvoice.mutate({ jobId, contractorEmail, contractorName });
  };

  const isPaid = paymentStatus?.paymentStatus === "paid" || job.paymentStatus === "paid";
  const isInvoiceSent = paymentStatus?.paymentStatus === "invoice_sent";

  return (
    <div className="space-y-4 max-w-lg">
      {/* Payment Status Banner */}
      {isPaid && (
        <Card className="border-emerald-300 bg-emerald-50">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-semibold text-emerald-800 text-sm">Payment Received</p>
              <p className="text-xs text-emerald-600">
                {job.paidAt ? `Paid on ${new Date(job.paidAt).toLocaleDateString()}` : "Fee collected successfully"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {isInvoiceSent && !isPaid && (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="p-4 flex items-center gap-3">
            <Send className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-semibold text-amber-800 text-sm">Invoice Sent — Awaiting Payment</p>
              <p className="text-xs text-amber-600">The contractor received a Stripe invoice via email.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fee Calculator */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Fee Calculator</CardTitle>
          <CardDescription className="text-xs">
            Enter the recovered supplement amount to calculate your fee.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Recovered Amount ($)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={recoveredAmount}
                onChange={(e) => setRecoveredAmount(e.target.value)}
                disabled={isPaid}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Your Fee (%)</Label>
              <Input
                type="number"
                min="1"
                max="30"
                step="0.5"
                value={feePercentage}
                onChange={(e) => setFeePercentage(e.target.value)}
                disabled={isPaid}
              />
            </div>
          </div>

          {calc && calc.supplementAmount > 0 && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Recovered Amount</span>
                <span className="font-semibold text-foreground">{formatCurrency(calc.supplementAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Your Fee ({calc.feePercentage}%)</span>
                <span className="font-bold text-primary text-base">{formatCurrency(calc.feeAmount)}</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between text-sm">
                <span className="text-muted-foreground">Contractor Net</span>
                <span className="font-semibold text-foreground">{formatCurrency(calc.contractorNet)}</span>
              </div>
            </div>
          )}

          {!isPaid && (
            <Button onClick={handleSave} disabled={updateJob.isPending} variant="outline" className="gap-2">
              {updateJob.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Payment Info
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Collect Payment */}
      {!isPaid && job.feeAmount && Number(job.feeAmount) > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              Collect Your Fee — {formatCurrency(job.feeAmount)}
            </CardTitle>
            <CardDescription className="text-xs">
              Choose how to collect your supplement recovery fee from the contractor.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Option 1: Pay Now (contractor pays in-app) */}
            <div className="border border-border rounded-lg p-4 space-y-3">
              <div>
                <p className="font-medium text-sm">Option 1 — Pay Now (In-App)</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Open a Stripe checkout page. The contractor pays your fee directly with a card.
                </p>
              </div>
              <Button
                onClick={handlePayNow}
                disabled={createCheckout.isPending}
                className="w-full gap-2"
              >
                {createCheckout.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <DollarSign className="w-4 h-4" />
                )}
                Pay Now via Stripe — {formatCurrency(job.feeAmount)}
              </Button>
              <p className="text-xs text-muted-foreground">Test card: 4242 4242 4242 4242 · Any future date · Any CVC</p>
            </div>

            {/* Option 2: Send Invoice */}
            <div className="border border-border rounded-lg p-4 space-y-3">
              <div>
                <p className="font-medium text-sm">Option 2 — Send Invoice via Email</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Stripe emails the contractor a professional invoice. They pay from their inbox.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Contractor Email *</Label>
                  <Input
                    type="email"
                    placeholder="contractor@company.com"
                    value={contractorEmail}
                    onChange={(e) => setContractorEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Contractor Name</Label>
                  <Input
                    placeholder="John Smith"
                    value={contractorName}
                    onChange={(e) => setContractorName(e.target.value)}
                  />
                </div>
              </div>
              <Button
                onClick={handleSendInvoice}
                disabled={sendInvoice.isPending || isInvoiceSent}
                variant="outline"
                className="w-full gap-2"
              >
                {sendInvoice.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {isInvoiceSent ? "Invoice Already Sent" : `Send Invoice — ${formatCurrency(job.feeAmount)}`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prompt to save first */}
      {!isPaid && (!job.feeAmount || Number(job.feeAmount) <= 0) && (
        <Card className="border-dashed">
          <CardContent className="p-4 text-center text-sm text-muted-foreground">
            <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-30" />
            Enter the recovered amount above and click <strong>Save Payment Info</strong> to unlock payment collection.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
