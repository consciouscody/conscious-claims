import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import {
  Plus,
  FileText,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Building2,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useLocation } from "wouter";
import { formatDistanceToNow } from "date-fns";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-700 border-gray-200" },
  estimate_uploaded: { label: "Estimate Uploaded", color: "bg-blue-100 text-blue-700 border-blue-200" },
  dossier_generated: { label: "Dossier Ready", color: "bg-purple-100 text-purple-700 border-purple-200" },
  email_drafted: { label: "Email Drafted", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  submitted: { label: "Submitted", color: "bg-amber-100 text-amber-700 border-amber-200" },
  approved: { label: "Approved", color: "bg-green-100 text-green-700 border-green-200" },
  denied: { label: "Denied", color: "bg-red-100 text-red-700 border-red-200" },
  paid: { label: "Paid", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
};

function formatCurrency(val: string | number | null | undefined) {
  if (!val) return "$0";
  const num = typeof val === "string" ? parseFloat(val) : val;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(num);
}

export default function Dashboard() {
  return (
    <DashboardLayout>
      <DashboardContent />
    </DashboardLayout>
  );
}

function DashboardContent() {
  const [, navigate] = useLocation();
  const { data: jobs, isLoading: jobsLoading } = trpc.jobs.list.useQuery();
  const { data: stats } = trpc.jobs.stats.useQuery();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Claims Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Get your claims approved on first submission with AI-powered forensic documentation</p>
        </div>
        <Button onClick={() => navigate("/jobs/new")} className="gap-2">
          <Plus className="w-4 h-4" />
          New Job
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Jobs</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stats?.total ?? 0}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Submitted</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stats?.submitted ?? 0}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Approved</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stats?.approved ?? 0}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Fees Earned</p>
                <p className="text-2xl font-bold text-foreground mt-1">{formatCurrency(stats?.totalFees)}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recovery Summary */}
      {(stats?.totalRecovered ?? 0) > 0 && (
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <div>
                <span className="font-semibold text-emerald-800">
                  {formatCurrency(stats?.totalRecovered)} total recovered
                </span>
                <span className="text-emerald-700 text-sm ml-2">
                  across {stats?.approved} approved supplements
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Jobs List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">All Jobs</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {jobsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : !jobs || jobs.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Building2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No jobs yet</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
                Create your first job and generate a forensic dossier to get your claim approved on first submission.
              </p>
              <Button onClick={() => navigate("/jobs/new")} className="gap-2">
                <Plus className="w-4 h-4" />
                Create First Job
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {jobs.map((job) => {
                const statusCfg = STATUS_CONFIG[job.status] || STATUS_CONFIG.draft;
                return (
                  <div
                    key={job.id}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => navigate(`/jobs/${job.id}`)}
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-foreground truncate">{job.propertyAddress}</span>
                        {job.claimNumber && (
                          <span className="text-xs text-muted-foreground font-mono">#{job.claimNumber}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                        {job.homeownerName && <span>{job.homeownerName}</span>}
                        {job.insuranceCarrier && <span>· {job.insuranceCarrier}</span>}
                        <span>· {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {job.supplementAmount && (
                        <div className="text-right hidden sm:block">
                          <div className="text-sm font-semibold text-foreground">{formatCurrency(job.supplementAmount)}</div>
                          <div className="text-xs text-muted-foreground">supplement</div>
                        </div>
                      )}
                      <Badge className={`text-xs border ${statusCfg.color}`} variant="outline">
                        {statusCfg.label}
                      </Badge>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
