import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Loader2, Shield, Search, MessageSquare, RefreshCw,
  ChevronDown, ChevronUp, Send, Clock, CheckCircle2,
  XCircle, DollarSign, Briefcase, AlertTriangle, Home,
  Droplets, User, Phone, Mail, Building2
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";

type JobStatus =
  | "draft"
  | "estimate_uploaded"
  | "dossier_generated"
  | "email_drafted"
  | "submitted"
  | "approved"
  | "denied"
  | "paid";

const STATUS_CONFIG: Record<JobStatus, { label: string; color: string; icon: React.ReactNode }> = {
  draft: { label: "Draft", color: "bg-zinc-700 text-zinc-200", icon: <Clock className="w-3 h-3" /> },
  estimate_uploaded: { label: "Estimate Uploaded", color: "bg-blue-900 text-blue-200", icon: <Briefcase className="w-3 h-3" /> },
  dossier_generated: { label: "Dossier Generated", color: "bg-indigo-900 text-indigo-200", icon: <CheckCircle2 className="w-3 h-3" /> },
  email_drafted: { label: "Email Drafted", color: "bg-purple-900 text-purple-200", icon: <Mail className="w-3 h-3" /> },
  submitted: { label: "Submitted to Adjuster", color: "bg-amber-900 text-amber-200", icon: <Send className="w-3 h-3" /> },
  approved: { label: "Approved", color: "bg-green-900 text-green-200", icon: <CheckCircle2 className="w-3 h-3" /> },
  denied: { label: "Denied", color: "bg-red-900 text-red-200", icon: <XCircle className="w-3 h-3" /> },
  paid: { label: "Paid", color: "bg-emerald-900 text-emerald-200", icon: <DollarSign className="w-3 h-3" /> },
};

function formatCurrency(val: string | number | null | undefined) {
  if (!val) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
    typeof val === "string" ? parseFloat(val) : val
  );
}

function timeAgo(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

type Job = {
  id: number;
  userId: number;
  tradeType: string;
  propertyAddress: string;
  homeownerName: string | null;
  claimNumber: string | null;
  insuranceCarrier: string | null;
  adjusterName: string | null;
  adjusterEmail: string | null;
  status: JobStatus;
  supplementAmount: string | null;
  recoveredAmount: string | null;
  feePercentage: string | null;
  feeAmount: string | null;
  paymentStatus: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  userName: string | null;
  userEmail: string | null;
  userCompany: string | null;
  userPhone: string | null;
};

function MessagePanel({ job, onClose }: { job: Job; onClose: () => void }) {
  const utils = trpc.useUtils();
  const { data: messages, isLoading } = trpc.admin.getClaimMessages.useQuery({ jobId: job.id });
  const [text, setText] = useState("");

  const sendMsg = trpc.admin.sendClaimMessage.useMutation({
    onSuccess: () => {
      utils.admin.getClaimMessages.invalidate({ jobId: job.id });
      setText("");
      toast.success("Message sent to customer");
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-semibold text-sm text-foreground">{job.propertyAddress}</p>
          <p className="text-xs text-muted-foreground">{job.userCompany || job.userName || job.userEmail}</p>
        </div>
        <Button size="sm" variant="ghost" onClick={onClose}>✕</Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 mb-3 min-h-0 max-h-64 pr-1">
        {isLoading && <Loader2 className="w-4 h-4 animate-spin mx-auto mt-4" />}
        {!isLoading && (!messages || messages.length === 0) && (
          <p className="text-xs text-muted-foreground text-center py-4">No messages yet. Send the first update.</p>
        )}
        {messages?.map((msg) => (
          <div
            key={msg.id}
            className={`rounded-lg px-3 py-2 text-sm max-w-[85%] ${
              msg.senderRole === "admin"
                ? "ml-auto bg-primary text-primary-foreground"
                : "bg-muted text-foreground"
            }`}
          >
            <p>{msg.message}</p>
            <p className="text-[10px] opacity-60 mt-0.5">{timeAgo(msg.createdAt)}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Send an update to the customer..."
          className="text-sm resize-none h-16"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (text.trim()) sendMsg.mutate({ jobId: job.id, message: text.trim() });
            }
          }}
        />
        <Button
          size="sm"
          className="self-end"
          disabled={!text.trim() || sendMsg.isPending}
          onClick={() => sendMsg.mutate({ jobId: job.id, message: text.trim() })}
        >
          {sendMsg.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}

function JobRow({ job, onMessage }: { job: Job; onMessage: (job: Job) => void }) {
  const utils = trpc.useUtils();
  const [expanded, setExpanded] = useState(false);
  const [newStatus, setNewStatus] = useState<JobStatus>(job.status);

  const updateStatus = trpc.admin.updateJobStatus.useMutation({
    onSuccess: () => {
      utils.admin.allJobs.invalidate();
      toast.success("Status updated");
    },
    onError: (e) => toast.error(e.message),
  });

  const cfg = STATUS_CONFIG[job.status] || STATUS_CONFIG.draft;

  return (
    <div className="border-b border-border last:border-0">
      {/* Main row */}
      <div
        className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Trade icon */}
        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
          {job.tradeType === "water_restoration" ? (
            <Droplets className="w-4 h-4 text-blue-400" />
          ) : (
            <Home className="w-4 h-4 text-primary" />
          )}
        </div>

        {/* Address + company */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{job.propertyAddress}</p>
          <p className="text-xs text-muted-foreground truncate">
            {job.userCompany || job.userName || job.userEmail || "Unknown contractor"}
            {job.claimNumber ? ` · #${job.claimNumber}` : ""}
            {job.insuranceCarrier ? ` · ${job.insuranceCarrier}` : ""}
          </p>
        </div>

        {/* Status badge */}
        <Badge className={`text-xs shrink-0 flex items-center gap-1 ${cfg.color}`}>
          {cfg.icon}
          {cfg.label}
        </Badge>

        {/* Supplement amount */}
        <div className="text-right shrink-0 hidden sm:block">
          <p className="text-sm font-semibold text-primary">{formatCurrency(job.supplementAmount)}</p>
          <p className="text-xs text-muted-foreground">supplement</p>
        </div>

        {/* Time */}
        <p className="text-xs text-muted-foreground shrink-0 hidden md:block">{timeAgo(job.updatedAt)}</p>

        {/* Expand */}
        <div className="shrink-0 text-muted-foreground">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-4 bg-muted/10 border-t border-border/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-3">
            {/* Contractor info */}
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Contractor</p>
              {job.userName && (
                <div className="flex items-center gap-1.5 text-sm">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{job.userName}</span>
                </div>
              )}
              {job.userCompany && (
                <div className="flex items-center gap-1.5 text-sm">
                  <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{job.userCompany}</span>
                </div>
              )}
              {job.userEmail && (
                <div className="flex items-center gap-1.5 text-sm">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                  <a href={`mailto:${job.userEmail}`} className="text-primary hover:underline">{job.userEmail}</a>
                </div>
              )}
              {job.userPhone && (
                <div className="flex items-center gap-1.5 text-sm">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                  <a href={`tel:${job.userPhone}`} className="text-primary hover:underline">{job.userPhone}</a>
                </div>
              )}
            </div>

            {/* Claim info */}
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Claim Details</p>
              {job.homeownerName && <p className="text-sm">Homeowner: <span className="text-foreground">{job.homeownerName}</span></p>}
              {job.claimNumber && <p className="text-sm">Claim #: <span className="text-foreground">{job.claimNumber}</span></p>}
              {job.insuranceCarrier && <p className="text-sm">Carrier: <span className="text-foreground">{job.insuranceCarrier}</span></p>}
              {job.adjusterName && <p className="text-sm">Adjuster: <span className="text-foreground">{job.adjusterName}</span></p>}
              {job.adjusterEmail && (
                <p className="text-sm">
                  <a href={`mailto:${job.adjusterEmail}`} className="text-primary hover:underline">{job.adjusterEmail}</a>
                </p>
              )}
            </div>

            {/* Financials */}
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Financials</p>
              <p className="text-sm">Supplement: <span className="text-primary font-semibold">{formatCurrency(job.supplementAmount)}</span></p>
              <p className="text-sm">Recovered: <span className="text-green-400 font-semibold">{formatCurrency(job.recoveredAmount)}</span></p>
              <p className="text-sm">Fee ({job.feePercentage || "12"}%): <span className="text-foreground">{formatCurrency(job.feeAmount)}</span></p>
              <p className="text-sm">Payment: <span className={job.paymentStatus === "paid" ? "text-green-400" : "text-muted-foreground"}>{job.paymentStatus || "unpaid"}</span></p>
            </div>
          </div>

          {/* Admin controls */}
          <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-border/50">
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">Change status:</p>
              <Select
                value={newStatus}
                onValueChange={(val) => setNewStatus(val as JobStatus)}
              >
                <SelectTrigger className="h-7 text-xs w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(STATUS_CONFIG) as JobStatus[]).map((s) => (
                    <SelectItem key={s} value={s} className="text-xs">{STATUS_CONFIG[s].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                className="h-7 text-xs"
                disabled={newStatus === job.status || updateStatus.isPending}
                onClick={() => updateStatus.mutate({ jobId: job.id, status: newStatus })}
              >
                {updateStatus.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Update"}
              </Button>
            </div>

            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs flex items-center gap-1.5"
              onClick={(e) => { e.stopPropagation(); onMessage(job); }}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Message Customer
            </Button>

            <p className="text-xs text-muted-foreground ml-auto">
              Created {new Date(job.createdAt).toLocaleDateString()} · Updated {timeAgo(job.updatedAt)}
            </p>
          </div>

          {job.notes && (
            <div className="mt-2 p-2 rounded bg-muted/30 text-xs text-muted-foreground">
              <span className="font-medium">Notes:</span> {job.notes}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminClaimsDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  if (user && user.role !== "admin") {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Shield className="w-12 h-12 text-muted-foreground" />
          <p className="text-muted-foreground">Admin access required.</p>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <ClaimsFeedContent />
    </DashboardLayout>
  );
}

function ClaimsFeedContent() {
  const utils = trpc.useUtils();
  const { data: allJobs, isLoading } = trpc.admin.allJobs.useQuery(undefined, {
    refetchInterval: 30000, // auto-refresh every 30s
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [messagingJob, setMessagingJob] = useState<Job | null>(null);

  const filtered = (allJobs as Job[] | undefined)?.filter((j) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      j.propertyAddress?.toLowerCase().includes(q) ||
      j.homeownerName?.toLowerCase().includes(q) ||
      j.claimNumber?.toLowerCase().includes(q) ||
      j.insuranceCarrier?.toLowerCase().includes(q) ||
      j.userName?.toLowerCase().includes(q) ||
      j.userEmail?.toLowerCase().includes(q) ||
      j.userCompany?.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || j.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Summary stats
  const totalJobs = allJobs?.length || 0;
  const submitted = allJobs?.filter((j) => j.status === "submitted").length || 0;
  const approved = allJobs?.filter((j) => j.status === "approved").length || 0;
  const totalSupplement = allJobs?.reduce((sum, j) => sum + (j.supplementAmount ? parseFloat(j.supplementAmount) : 0), 0) || 0;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-primary" />
            Live Claims Feed
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Every claim across all customers — real time.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5"
          onClick={() => utils.admin.allJobs.invalidate()}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </Button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Claims", value: totalJobs, color: "text-foreground" },
          { label: "Submitted to Adjuster", value: submitted, color: "text-amber-400" },
          { label: "Approved", value: approved, color: "text-green-400" },
          { label: "Total Supplement $", value: formatCurrency(totalSupplement), color: "text-primary" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-4 pb-3">
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search address, contractor, claim #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 text-sm">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {(Object.keys(STATUS_CONFIG) as JobStatus[]).map((s) => (
              <SelectItem key={s} value={s}>{STATUS_CONFIG[s].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Claims list */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">
            {filtered ? `${filtered.length} claim${filtered.length !== 1 ? "s" : ""}` : "Loading..."}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading && (
            <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading claims...</span>
            </div>
          )}
          {!isLoading && (!filtered || filtered.length === 0) && (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
              <AlertTriangle className="w-8 h-8" />
              <p className="text-sm">No claims found.</p>
              {search || statusFilter !== "all" ? (
                <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setStatusFilter("all"); }}>
                  Clear filters
                </Button>
              ) : (
                <p className="text-xs">Claims will appear here as customers submit them.</p>
              )}
            </div>
          )}
          {filtered?.map((job) => (
            <JobRow key={job.id} job={job} onMessage={setMessagingJob} />
          ))}
        </CardContent>
      </Card>

      {/* Message dialog */}
      <Dialog open={!!messagingJob} onOpenChange={(open) => { if (!open) setMessagingJob(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="w-4 h-4 text-primary" />
              Message Customer
            </DialogTitle>
          </DialogHeader>
          {messagingJob && (
            <MessagePanel job={messagingJob} onClose={() => setMessagingJob(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
