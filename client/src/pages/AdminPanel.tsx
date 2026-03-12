import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Users, DollarSign, Briefcase, Percent, ChevronRight, Shield } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export default function AdminPanel() {
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
      <AdminContent />
    </DashboardLayout>
  );
}

function AdminContent() {
  const utils = trpc.useUtils();
  const { data: stats } = trpc.admin.platformStats.useQuery();
  const { data: userList, isLoading } = trpc.admin.listUsers.useQuery();

  const [feeDialogUser, setFeeDialogUser] = useState<{ id: number; name: string | null; email: string | null; currentFee: number | null } | null>(null);
  const [newFee, setNewFee] = useState("");
  const [search, setSearch] = useState("");

  const setUserFee = trpc.admin.setUserFee.useMutation({
    onSuccess: () => {
      utils.admin.listUsers.invalidate();
      toast.success(`Fee updated to ${newFee}% for ${feeDialogUser?.name || feeDialogUser?.email}`);
      setFeeDialogUser(null);
      setNewFee("");
    },
    onError: (e) => toast.error(e.message),
  });

  const setUserRole = trpc.admin.setUserRole.useMutation({
    onSuccess: () => {
      utils.admin.listUsers.invalidate();
      toast.success("Role updated");
    },
    onError: (e) => toast.error(e.message),
  });

  const filtered = userList?.filter((u) => {
    const q = search.toLowerCase();
    return (
      !q ||
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.companyName?.toLowerCase().includes(q)
    );
  });

  function openFeeDialog(u: typeof userList extends (infer T)[] | undefined ? T : never) {
    if (!u) return;
    setFeeDialogUser({ id: u.id, name: u.name, email: u.email, currentFee: u.currentFeePercentage });
    setNewFee(String(u.currentFeePercentage ?? 10));
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          Admin Panel
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Manage users, fee rates, and platform activity.</p>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats?.totalUsers ?? "—"}</p>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats?.totalJobs ?? "—"}</p>
                <p className="text-xs text-muted-foreground">Total Jobs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats ? formatCurrency(stats.totalRecovered) : "—"}
                </p>
                <p className="text-xs text-muted-foreground">Total Recovered (Paid)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle className="text-base">Users</CardTitle>
            <Input
              placeholder="Search by name, email, or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs text-sm"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading && (
            <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading users...</span>
            </div>
          )}
          {!isLoading && filtered?.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-12">No users found.</p>
          )}
          <div className="divide-y divide-border">
            {filtered?.map((u) => (
              <div key={u.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
                  {(u.name || u.email || "?")[0].toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-foreground text-sm truncate">
                      {u.name || u.email || `User #${u.id}`}
                    </span>
                    {u.role === "admin" && (
                      <Badge variant="outline" className="text-xs text-purple-600 border-purple-300 bg-purple-50">
                        Admin
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap">
                    {u.email && <span>{u.email}</span>}
                    {u.companyName && <span>· {u.companyName}</span>}
                    <span>· {u.jobCount} job{u.jobCount !== 1 ? "s" : ""}</span>
                    {u.totalRecovered > 0 && <span>· {formatCurrency(u.totalRecovered)} recovered</span>}
                  </div>
                </div>

                {/* Fee Badge */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => openFeeDialog(u)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm font-medium text-foreground"
                    title="Click to change fee rate"
                  >
                    <Percent className="w-3.5 h-3.5 text-primary" />
                    {u.currentFeePercentage != null ? `${u.currentFeePercentage}%` : "Set fee"}
                  </button>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fee Edit Dialog */}
      <Dialog open={!!feeDialogUser} onOpenChange={(open) => { if (!open) { setFeeDialogUser(null); setNewFee(""); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Set Fee Rate</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Setting fee for <strong>{feeDialogUser?.name || feeDialogUser?.email}</strong>.
              This updates all their existing jobs and will apply to new jobs going forward.
            </p>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Fee Percentage</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  max="30"
                  step="0.5"
                  value={newFee}
                  onChange={(e) => setNewFee(e.target.value)}
                  className="max-w-[100px]"
                  autoFocus
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
              <div className="flex gap-2 pt-1">
                {[8, 10, 12, 15].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setNewFee(String(pct))}
                    className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                      newFee === String(pct)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setFeeDialogUser(null); setNewFee(""); }}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!feeDialogUser) return;
                const fee = parseFloat(newFee);
                if (isNaN(fee) || fee < 1 || fee > 30) {
                  toast.error("Enter a fee between 1% and 30%");
                  return;
                }
                setUserFee.mutate({ userId: feeDialogUser.id, feePercentage: fee });
              }}
              disabled={setUserFee.isPending}
            >
              {setUserFee.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Save Fee Rate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
