import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Loader2, CheckCircle2, Clock, Send, DollarSign,
  MessageSquare, ChevronRight, AlertTriangle, Swords,
  HandshakeIcon, Home, Droplets, ArrowRight
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

type JobStatus =
  | "draft"
  | "estimate_uploaded"
  | "dossier_generated"
  | "email_drafted"
  | "submitted"
  | "approved"
  | "denied"
  | "paid";

const TIMELINE_STEPS: { status: JobStatus[]; label: string; desc: string }[] = [
  {
    status: ["estimate_uploaded"],
    label: "Estimate Uploaded",
    desc: "Your insurance estimate has been received and analyzed.",
  },
  {
    status: ["dossier_generated"],
    label: "Dossier Generated",
    desc: "AI generated your forensic compliance blueprint and damage assessment.",
  },
  {
    status: ["email_drafted"],
    label: "Adjuster Email Ready",
    desc: "Your professional supplement request letter is drafted.",
  },
  {
    status: ["submitted"],
    label: "Submitted to Adjuster",
    desc: "Your supplement has been sent. Adjuster has 10–15 business days to respond.",
  },
  {
    status: ["approved", "denied", "paid"],
    label: "Adjuster Response",
    desc: "Waiting for the insurance company's decision.",
  },
  {
    status: ["paid"],
    label: "Payment Received",
    desc: "Supplement approved and payment processed.",
  },
];

function getStepState(stepStatuses: JobStatus[], currentStatus: JobStatus) {
  const order: JobStatus[] = [
    "draft",
    "estimate_uploaded",
    "supplement_generated",
    "email_drafted",
    "submitted",
    "approved",
    "denied",
    "paid",
  ];
  const currentIdx = order.indexOf(currentStatus);
  const stepIdx = Math.max(...stepStatuses.map((s) => order.indexOf(s)));
  if (stepStatuses.includes(currentStatus)) return "active";
  if (currentIdx > stepIdx) return "done";
  return "pending";
}

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
  propertyAddress: string;
  homeownerName: string | null;
  claimNumber: string | null;
  insuranceCarrier: string | null;
  tradeType: string;
  status: JobStatus;
  supplementAmount: string | null;
  recoveredAmount: string | null;
  feePercentage: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function JobStatusCard({ job }: { job: Job }) {
  const utils = trpc.useUtils();
  const { data: messages } = trpc.claims.getMessages.useQuery({ jobId: job.id });
  const [replyText, setReplyText] = useState("");
  const [decisionDialog, setDecisionDialog] = useState<"accept" | "keep_fighting" | null>(null);
  const [decisionNote, setDecisionNote] = useState("");

  const sendMsg = trpc.claims.sendMessage.useMutation({
    onSuccess: () => {
      utils.claims.getMessages.invalidate({ jobId: job.id });
      setReplyText("");
      toast.success("Message sent");
    },
  });

  const makeDecision = trpc.claims.makeDecision.useMutation({
    onSuccess: (data) => {
      utils.jobs.list.invalidate();
      setDecisionDialog(null);
      setDecisionNote("");
      if (data.decision === "accept") {
        toast.success("Decision recorded — your team will process the settlement.");
      } else {
        toast.success("Got it — we'll keep pushing for the full amount.");
      }
    },
    onError: (e) => toast.error(e.message),
  });

  const unreadCount = messages?.filter((m) => m.senderRole === "admin" && !m.isRead).length || 0;

  const showDecisionButtons =
    job.status === "submitted" || job.status === "approved" || job.status === "denied";

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="bg-muted/30 px-5 py-4 border-b border-border flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {job.tradeType === "water_restoration" ? (
              <Droplets className="w-4 h-4 text-blue-400" />
            ) : (
              <Home className="w-4 h-4 text-primary" />
            )}
            <p className="font-semibold text-foreground">{job.propertyAddress}</p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {job.homeownerName && <span>Homeowner: {job.homeownerName}</span>}
            {job.claimNumber && <span>Claim #: {job.claimNumber}</span>}
            {job.insuranceCarrier && <span>{job.insuranceCarrier}</span>}
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-bold text-primary">{formatCurrency(job.supplementAmount)}</p>
          <p className="text-xs text-muted-foreground">supplement found</p>
        </div>
      </div>

      <CardContent className="p-5 space-y-5">
        {/* Timeline */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Claim Progress</p>
          <div className="space-y-2">
            {TIMELINE_STEPS.map((step, i) => {
              const state = getStepState(step.status, job.status);
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {state === "done" ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : state === "active" ? (
                      <div className="w-4 h-4 rounded-full border-2 border-primary bg-primary/20 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-border" />
                    )}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${state === "pending" ? "text-muted-foreground" : "text-foreground"}`}>
                      {step.label}
                    </p>
                    {state === "active" && (
                      <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Decision buttons — shown when adjuster has responded or claim is submitted */}
        {showDecisionButtons && (
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <p className="text-sm font-semibold text-foreground mb-1">What do you want to do?</p>
            <p className="text-xs text-muted-foreground mb-3">
              {job.status === "submitted"
                ? "Your supplement is with the adjuster. Once they respond, you can decide your next move."
                : job.status === "approved"
                ? "Your supplement was approved. You can accept the settlement or push for more."
                : "The adjuster denied some items. You can accept what they offered or fight back with documentation."}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex items-center gap-1.5 border-green-600 text-green-400 hover:bg-green-950"
                onClick={() => setDecisionDialog("accept")}
              >
                <DollarSign className="w-3.5 h-3.5" />
                Accept & Close
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex items-center gap-1.5 border-amber-600 text-amber-400 hover:bg-amber-950"
                onClick={() => setDecisionDialog("keep_fighting")}
              >
                <Swords className="w-3.5 h-3.5" />
                Keep Fighting
              </Button>
            </div>
          </div>
        )}

        {/* Messages from Cody / Conscious Claims team */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              Updates from Your Team
              {unreadCount > 0 && (
                <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0">{unreadCount} new</Badge>
              )}
            </p>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
            {(!messages || messages.length === 0) && (
              <p className="text-xs text-muted-foreground italic">No updates yet. Your team will post here as your claim progresses.</p>
            )}
            {messages?.map((msg) => (
              <div
                key={msg.id}
                className={`rounded-lg px-3 py-2 text-sm ${
                  msg.senderRole === "admin"
                    ? "bg-primary/10 border border-primary/20 text-foreground"
                    : "bg-muted text-muted-foreground ml-6"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[10px] font-semibold text-muted-foreground">
                    {msg.senderRole === "admin" ? "Conscious Claims Team" : "You"}
                  </span>
                  <span className="text-[10px] text-muted-foreground">· {timeAgo(msg.createdAt)}</span>
                </div>
                <p>{msg.message}</p>
              </div>
            ))}
          </div>

          {/* Reply box */}
          <div className="flex gap-2">
            <Textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Ask a question or send an update..."
              className="text-sm resize-none h-14"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (replyText.trim()) sendMsg.mutate({ jobId: job.id, message: replyText.trim() });
                }
              }}
            />
            <Button
              size="sm"
              className="self-end"
              disabled={!replyText.trim() || sendMsg.isPending}
              onClick={() => sendMsg.mutate({ jobId: job.id, message: replyText.trim() })}
            >
              {sendMsg.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Decision confirmation dialogs */}
      <Dialog open={decisionDialog === "accept"} onOpenChange={(o) => !o && setDecisionDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              Accept Settlement
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            You're choosing to accept the current offer and close this claim. Your team will process the settlement and you'll receive your check.
          </p>
          <Textarea
            value={decisionNote}
            onChange={(e) => setDecisionNote(e.target.value)}
            placeholder="Optional: any notes for your team? (e.g. 'Need the money by Friday')"
            className="text-sm resize-none h-16 mt-2"
          />
          <DialogFooter className="gap-2">
            <Button variant="ghost" size="sm" onClick={() => setDecisionDialog(null)}>Cancel</Button>
            <Button
              size="sm"
              className="bg-green-700 hover:bg-green-600 text-white"
              disabled={makeDecision.isPending}
              onClick={() => makeDecision.mutate({ jobId: job.id, decision: "accept", note: decisionNote || undefined })}
            >
              {makeDecision.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm — Accept Settlement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={decisionDialog === "keep_fighting"} onOpenChange={(o) => !o && setDecisionDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Swords className="w-5 h-5 text-amber-400" />
              Keep Fighting
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            You're choosing to push back on the adjuster's response. Your team will prepare additional documentation and escalate the claim.
          </p>
          <Textarea
            value={decisionNote}
            onChange={(e) => setDecisionNote(e.target.value)}
            placeholder="Optional: what do you want to fight for? (e.g. 'They denied the drip edge and pipe boots')"
            className="text-sm resize-none h-16 mt-2"
          />
          <DialogFooter className="gap-2">
            <Button variant="ghost" size="sm" onClick={() => setDecisionDialog(null)}>Cancel</Button>
            <Button
              size="sm"
              className="bg-amber-700 hover:bg-amber-600 text-white"
              disabled={makeDecision.isPending}
              onClick={() => makeDecision.mutate({ jobId: job.id, decision: "keep_fighting", note: decisionNote || undefined })}
            >
              {makeDecision.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Let's Fight — Keep Going"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default function ClaimStatus() {
  const { data: jobs, isLoading } = trpc.jobs.list.useQuery();

  return (
    <DashboardLayout>
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-primary" />
            My Claims
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Track every claim, see updates from your team, and decide your next move.
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading your claims...</span>
          </div>
        )}

        {!isLoading && (!jobs || jobs.length === 0) && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
              <AlertTriangle className="w-10 h-10" />
              <p className="font-medium">No claims yet</p>
              <p className="text-sm text-center">Start by creating a new job and uploading your estimate.</p>
              <Button size="sm" onClick={() => window.location.href = "/new-job"} className="mt-2">
                Create First Job <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        )}

        {jobs?.map((job) => (
          <JobStatusCard key={job.id} job={job as any} />
        ))}
      </div>
    </DashboardLayout>
  );
}
