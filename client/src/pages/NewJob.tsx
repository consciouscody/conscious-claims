import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Building2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function NewJob() {
  return (
    <DashboardLayout>
      <NewJobContent />
    </DashboardLayout>
  );
}

function NewJobContent() {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  const [form, setForm] = useState({
    propertyAddress: "",
    homeownerName: "",
    claimNumber: "",
    insuranceCarrier: "",
    adjusterName: "",
    adjusterEmail: "",
    adjusterPhone: "",
    dateOfLoss: "",
    feePercentage: "12",
    notes: "",
  });

  const createJob = trpc.jobs.create.useMutation({
    onSuccess: () => {
      utils.jobs.list.invalidate();
      utils.jobs.stats.invalidate();
      toast.success("Job created successfully");
      navigate("/dashboard");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create job");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.propertyAddress.trim()) {
      toast.error("Property address is required");
      return;
    }
    createJob.mutate(form);
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-foreground">New Supplement Job</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Enter the claim and property details to get started.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Property Info */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Property & Claim Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="address">Property Address <span className="text-destructive">*</span></Label>
              <Input
                id="address"
                placeholder="123 Main St, Atlanta, GA 30301"
                value={form.propertyAddress}
                onChange={set("propertyAddress")}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="homeowner">Homeowner Name</Label>
                <Input
                  id="homeowner"
                  placeholder="John Smith"
                  value={form.homeownerName}
                  onChange={set("homeownerName")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="claim">Claim Number</Label>
                <Input
                  id="claim"
                  placeholder="CLM-2024-001234"
                  value={form.claimNumber}
                  onChange={set("claimNumber")}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="carrier">Insurance Carrier</Label>
                <Input
                  id="carrier"
                  placeholder="State Farm, Allstate, etc."
                  value={form.insuranceCarrier}
                  onChange={set("insuranceCarrier")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dol">Date of Loss</Label>
                <Input
                  id="dol"
                  type="date"
                  value={form.dateOfLoss}
                  onChange={set("dateOfLoss")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Adjuster Info */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Adjuster Contact</CardTitle>
            <CardDescription className="text-xs">Used to pre-fill the supplement email</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="adjName">Adjuster Name</Label>
              <Input
                id="adjName"
                placeholder="Jane Doe"
                value={form.adjusterName}
                onChange={set("adjusterName")}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="adjEmail">Adjuster Email</Label>
                <Input
                  id="adjEmail"
                  type="email"
                  placeholder="adjuster@carrier.com"
                  value={form.adjusterEmail}
                  onChange={set("adjusterEmail")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="adjPhone">Adjuster Phone</Label>
                <Input
                  id="adjPhone"
                  type="tel"
                  placeholder="(555) 000-0000"
                  value={form.adjusterPhone}
                  onChange={set("adjusterPhone")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fee & Notes */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Fee & Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fee">Your Fee Percentage (%)</Label>
              <Input
                id="fee"
                type="number"
                min="1"
                max="30"
                step="0.5"
                placeholder="12"
                value={form.feePercentage}
                onChange={set("feePercentage")}
                className="max-w-[120px]"
              />
              <p className="text-xs text-muted-foreground">
                Your percentage of the recovered supplement amount (typically 10–15%)
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional context about this claim..."
                value={form.notes}
                onChange={set("notes")}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={createJob.isPending} className="gap-2">
            {createJob.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Create Job
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate("/dashboard")}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
