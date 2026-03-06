import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Link2, Unlink, RefreshCw, Copy, CheckCircle2, AlertCircle, Clock, Zap, Building2 } from "lucide-react";

const CRM_OPTIONS = [
  { value: "jobnimbus", label: "JobNimbus", logo: "JN", color: "bg-blue-600", hasApi: true, zapierUrl: "https://zapier.com/apps/jobnimbus/integrations" },
  { value: "acculynx", label: "AccuLynx", logo: "AL", color: "bg-green-600", hasApi: true, zapierUrl: "https://zapier.com/apps/acculynx/integrations" },
  { value: "roofr", label: "Roofr", logo: "RF", color: "bg-orange-600", hasApi: false, zapierUrl: "https://zapier.com/apps/roofr/integrations" },
  { value: "contractors_cloud", label: "Contractors Cloud", logo: "CC", color: "bg-purple-600", hasApi: false, zapierUrl: "https://zapier.com/apps/contractors-cloud/integrations" },
  { value: "hubspot", label: "HubSpot", logo: "HS", color: "bg-red-600", hasApi: false, zapierUrl: "https://zapier.com/apps/hubspot/integrations" },
  { value: "zapier", label: "Other (via Zapier)", logo: "ZP", color: "bg-yellow-600", hasApi: false, zapierUrl: "https://zapier.com" },
];

function CrmLogo({ type, size = "md" }: { type: string; size?: "sm" | "md" }) {
  const crm = CRM_OPTIONS.find((c) => c.value === type);
  if (!crm) return null;
  const s = size === "sm" ? "w-7 h-7 text-xs" : "w-10 h-10 text-sm";
  return (
    <div className={`${s} ${crm.color} rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {crm.logo}
    </div>
  );
}

export default function Integrations() {
  const utils = trpc.useUtils();
  const { data: integrations, isLoading } = trpc.crm.list.useQuery();

  const [connectOpen, setConnectOpen] = useState(false);
  const [selectedCrm, setSelectedCrm] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [webhookCopied, setWebhookCopied] = useState<number | null>(null);
  const [testingId, setTestingId] = useState<number | null>(null);
  const [syncingId, setSyncingId] = useState<number | null>(null);
  const [zapierGuideId, setZapierGuideId] = useState<number | null>(null);

  const connect = trpc.crm.connect.useMutation({
    onSuccess: () => {
      utils.crm.list.invalidate();
      setConnectOpen(false);
      setSelectedCrm("");
      setDisplayName("");
      setApiKey("");
      toast.success("CRM connected successfully");
    },
    onError: (e) => toast.error(e.message),
  });

  const disconnect = trpc.crm.disconnect.useMutation({
    onSuccess: () => {
      utils.crm.list.invalidate();
      toast.success("CRM disconnected");
    },
    onError: (e) => toast.error(e.message),
  });

  const testConnection = trpc.crm.testConnection.useMutation({
    onSuccess: (result) => {
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
      setTestingId(null);
    },
    onError: (e) => {
      toast.error(e.message);
      setTestingId(null);
    },
  });

  const syncJobs = trpc.crm.syncJobs.useMutation({
    onSuccess: (result) => {
      utils.crm.list.invalidate();
      utils.jobs.list.invalidate();
      toast.success(`Synced ${result.imported} job${result.imported !== 1 ? "s" : ""} from CRM`);
      setSyncingId(null);
    },
    onError: (e) => {
      toast.error(e.message);
      setSyncingId(null);
    },
  });

  const selectedCrmOption = CRM_OPTIONS.find((c) => c.value === selectedCrm);
  const webhookBaseUrl = window.location.origin;

  function copyWebhookUrl(secret: string, id: number) {
    const url = `${webhookBaseUrl}/api/crm/webhook/${secret}`;
    navigator.clipboard.writeText(url).then(() => {
      setWebhookCopied(id);
      setTimeout(() => setWebhookCopied(null), 2000);
    });
  }

  const zapierIntegration = integrations?.find((i) => i.id === zapierGuideId);
  const zapierCrmOption = zapierIntegration ? CRM_OPTIONS.find((c) => c.value === zapierIntegration.crmType) : null;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">CRM Integrations</h1>
            <p className="text-muted-foreground mt-1">
              Connect your roofing CRM to automatically import jobs into SupplementAI.
            </p>
          </div>
          <Button onClick={() => setConnectOpen(true)} className="gap-2">
            <Link2 className="w-4 h-4" />
            Connect CRM
          </Button>
        </div>

        {/* How it works */}
        <Card className="border-border bg-muted/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-500" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</div>
                <div>
                  <p className="font-medium text-foreground">Connect your CRM</p>
                  <p className="text-muted-foreground">Choose your CRM and paste your API key, or use the Zapier webhook URL.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</div>
                <div>
                  <p className="font-medium text-foreground">Jobs sync automatically</p>
                  <p className="text-muted-foreground">New jobs in your CRM appear in SupplementAI instantly — no manual entry.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</div>
                <div>
                  <p className="font-medium text-foreground">Upload & supplement</p>
                  <p className="text-muted-foreground">Upload the Xactimate estimate and photos directly to the imported job.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connected integrations */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Connected CRMs</h2>

          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading integrations...</span>
            </div>
          )}

          {!isLoading && (!integrations || integrations.length === 0) && (
            <Card className="border-dashed border-border">
              <CardContent className="py-12 text-center">
                <Building2 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium text-foreground mb-1">No CRMs connected yet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect your roofing CRM to start importing jobs automatically.
                </p>
                <Button variant="outline" size="sm" onClick={() => setConnectOpen(true)} className="gap-2">
                  <Link2 className="w-3.5 h-3.5" />
                  Connect Your First CRM
                </Button>
              </CardContent>
            </Card>
          )}

          {integrations?.map((integration) => {
            const crmOption = CRM_OPTIONS.find((c) => c.value === integration.crmType);
            return (
              <Card key={integration.id} className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <CrmLogo type={integration.crmType} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground">{integration.displayName}</span>
                        <Badge
                          variant="outline"
                          className={
                            integration.status === "active"
                              ? "text-green-700 border-green-300 bg-green-50"
                              : integration.status === "error"
                              ? "text-red-700 border-red-300 bg-red-50"
                              : "text-muted-foreground"
                          }
                        >
                          {integration.status === "active" ? (
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                          ) : integration.status === "error" ? (
                            <AlertCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <Clock className="w-3 h-3 mr-1" />
                          )}
                          {integration.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{crmOption?.label}</span>
                      </div>

                      <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                        {integration.jobsSynced !== null && integration.jobsSynced !== undefined && (
                          <p>{integration.jobsSynced} jobs imported total</p>
                        )}
                        {integration.lastSyncAt && (
                          <p>Last sync: {new Date(integration.lastSyncAt).toLocaleString()}</p>
                        )}
                        {integration.lastSyncStatus && <p>{integration.lastSyncStatus}</p>}
                      </div>

                      {/* Webhook URL */}
                      {integration.webhookSecret && (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-foreground mb-1">Zapier Webhook URL</p>
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-muted px-2 py-1 rounded border border-border flex-1 truncate">
                              {webhookBaseUrl}/api/crm/webhook/{integration.webhookSecret}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2"
                              onClick={() => copyWebhookUrl(integration.webhookSecret!, integration.id)}
                            >
                              {webhookCopied === integration.id ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Zapier setup guide */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs"
                        onClick={() => setZapierGuideId(integration.id)}
                      >
                        <Zap className="w-3 h-3" />
                        Setup Guide
                      </Button>

                      {/* Sync button for native API integrations */}
                      {integration.apiKey && (["jobnimbus", "acculynx"] as const).includes(integration.crmType as "jobnimbus" | "acculynx") && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-xs"
                          disabled={syncingId === integration.id}
                          onClick={() => {
                            setSyncingId(integration.id);
                            syncJobs.mutate({ integrationId: integration.id });
                          }}
                        >
                          {syncingId === integration.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <RefreshCw className="w-3 h-3" />
                          )}
                          Sync Now
                        </Button>
                      )}

                      {/* Disconnect */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-xs text-destructive hover:text-destructive"
                        disabled={disconnect.isPending}
                        onClick={() => disconnect.mutate({ id: integration.id })}
                      >
                        <Unlink className="w-3 h-3" />
                        Disconnect
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Supported CRMs grid */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Supported CRMs</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {CRM_OPTIONS.map((crm) => (
              <Card key={crm.value} className="border-border">
                <CardContent className="p-3 flex items-center gap-3">
                  <CrmLogo type={crm.value} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{crm.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {crm.hasApi ? "API + Zapier" : "Zapier webhook"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Connect CRM Dialog */}
      <Dialog open={connectOpen} onOpenChange={setConnectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect a CRM</DialogTitle>
            <DialogDescription>
              Choose your CRM and enter a name for this connection. For native API integrations, paste your API key. For all others, use the Zapier webhook URL.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>CRM Platform</Label>
              <Select value={selectedCrm} onValueChange={setSelectedCrm}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your CRM..." />
                </SelectTrigger>
                <SelectContent>
                  {CRM_OPTIONS.map((crm) => (
                    <SelectItem key={crm.value} value={crm.value}>
                      <div className="flex items-center gap-2">
                        <span>{crm.label}</span>
                        {crm.hasApi && (
                          <Badge variant="outline" className="text-xs py-0">API</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Connection Name</Label>
              <Input
                placeholder={selectedCrmOption ? `My ${selectedCrmOption.label}` : "e.g. My JobNimbus"}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">A label to identify this connection.</p>
            </div>

            {selectedCrmOption?.hasApi && (
              <div className="space-y-2">
                <Label>API Key <span className="text-muted-foreground">(optional — enables direct sync)</span></Label>
                <Input
                  type="password"
                  placeholder="Paste your API key..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Find your API key in {selectedCrmOption.label} → Settings → Integrations → API.
                  Leave blank to use Zapier webhook only.
                </p>
              </div>
            )}

            {selectedCrm && !selectedCrmOption?.hasApi && (
              <div className="rounded-lg bg-muted/50 border border-border p-3 text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Zapier Webhook Setup</p>
                <p>After connecting, you'll get a unique webhook URL. In Zapier, create a Zap:</p>
                <ol className="mt-2 space-y-1 list-decimal list-inside text-xs">
                  <li>Trigger: New Job in {selectedCrmOption?.label}</li>
                  <li>Action: Webhooks by Zapier → POST</li>
                  <li>URL: your SupplementAI webhook URL</li>
                </ol>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConnectOpen(false)}>Cancel</Button>
            <Button
              disabled={!selectedCrm || !displayName || connect.isPending}
              onClick={() =>
                connect.mutate({
                  crmType: selectedCrm as any,
                  displayName: displayName || `My ${selectedCrmOption?.label}`,
                  apiKey: apiKey || undefined,
                })
              }
            >
              {connect.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Connect CRM
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Zapier Setup Guide Dialog */}
      <Dialog open={zapierGuideId !== null} onOpenChange={() => setZapierGuideId(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Zapier Setup Guide</DialogTitle>
            <DialogDescription>
              Follow these steps to automatically send jobs from {zapierCrmOption?.label || "your CRM"} to SupplementAI.
            </DialogDescription>
          </DialogHeader>

          {zapierIntegration && (
            <div className="space-y-4 py-2 text-sm">
              <div className="space-y-2">
                <p className="font-medium text-foreground">Your Webhook URL</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-muted px-2 py-1.5 rounded border border-border flex-1 break-all">
                    {webhookBaseUrl}/api/crm/webhook/{zapierIntegration.webhookSecret}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 flex-shrink-0"
                    onClick={() => copyWebhookUrl(zapierIntegration.webhookSecret!, zapierIntegration.id)}
                  >
                    {webhookCopied === zapierIntegration.id ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <p className="font-medium text-foreground">Step-by-Step Zapier Setup</p>
                <ol className="space-y-3 text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">1</span>
                    <span>Go to <a href="https://zapier.com" target="_blank" rel="noopener noreferrer" className="text-orange-500 underline">zapier.com</a> and click <strong>Create Zap</strong>.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">2</span>
                    <span>Set the <strong>Trigger</strong> to <strong>{zapierCrmOption?.label}</strong> → <strong>New Job</strong> (or New Contact, depending on your workflow).</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">3</span>
                    <span>Set the <strong>Action</strong> to <strong>Webhooks by Zapier</strong> → <strong>POST</strong>.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">4</span>
                    <span>Paste your webhook URL above into the <strong>URL</strong> field.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">5</span>
                    <span>Map these fields from your CRM: <strong>property_address</strong>, <strong>homeowner_name</strong>, <strong>claim_number</strong>, <strong>insurance_carrier</strong>.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">6</span>
                    <span>Turn on the Zap. Every new job in {zapierCrmOption?.label} will automatically appear in SupplementAI.</span>
                  </li>
                </ol>
              </div>

              {zapierCrmOption?.zapierUrl && (
                <a
                  href={zapierCrmOption.zapierUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-orange-500 hover:underline text-sm font-medium"
                >
                  <Zap className="w-4 h-4" />
                  Open {zapierCrmOption.label} on Zapier →
                </a>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setZapierGuideId(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
