import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Phone, Loader2, Copy, Check, Sparkles } from "lucide-react";

export default function CallScriptGenerator() {
  const [form, setForm] = useState({
    companyName: "",
    ownerName: "",
    city: "",
    state: "",
    notes: "",
  });
  const [script, setScript] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateScript = trpc.admin.generateCallScript.useMutation({
    onSuccess: (data) => {
      setScript(typeof data.script === "string" ? data.script : String(data.script));
    },
    onError: (e) => toast.error(e.message || "Failed to generate script"),
  });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleCopy = () => {
    if (!script) return;
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Script copied to clipboard");
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Phone className="w-4 h-4 text-primary" />
            Cold Call Script Generator
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Enter the contractor's info and get a personalized McConaughey-style call script with objection handlers and voicemail.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">Company Name *</Label>
              <Input
                placeholder="e.g. Storm Shield Roofing"
                value={form.companyName}
                onChange={set("companyName")}
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Owner Name</Label>
              <Input
                placeholder="e.g. Mike Johnson"
                value={form.ownerName}
                onChange={set("ownerName")}
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">State</Label>
              <Input
                placeholder="e.g. TX"
                value={form.state}
                onChange={set("state")}
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">City</Label>
              <Input
                placeholder="e.g. Dallas"
                value={form.city}
                onChange={set("city")}
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Notes (optional)</Label>
              <Input
                placeholder="e.g. Large company, hail market"
                value={form.notes}
                onChange={set("notes")}
                className="text-sm"
              />
            </div>
          </div>
          <Button
            onClick={() => {
              if (!form.companyName.trim()) {
                toast.error("Enter a company name");
                return;
              }
              generateScript.mutate(form);
            }}
            disabled={generateScript.isPending}
            className="w-full gap-2"
          >
            {generateScript.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating script...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Call Script
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {script && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Your Script — {form.companyName}</CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopy}
                className="gap-1.5 h-7 text-xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-green-500" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy All
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={script}
              readOnly
              rows={20}
              className="text-sm font-mono resize-none bg-muted/30 border-border"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
