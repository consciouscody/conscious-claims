import DashboardLayout from "@/components/DashboardLayout";
import CallScriptGenerator from "@/components/CallScriptGenerator";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { useLocation } from "wouter";

export default function CallScript() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  if (user && user.role !== "admin") {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Shield className="w-12 h-12 text-muted-foreground" />
          <p className="text-muted-foreground">Admin access required.</p>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Call Script Generator</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Generate a personalized cold call script for any roofing contractor — with objection handlers and voicemail.
          </p>
        </div>
        <CallScriptGenerator />
      </div>
    </DashboardLayout>
  );
}
