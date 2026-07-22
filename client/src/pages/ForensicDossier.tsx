import { useState } from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Download, FileText, AlertCircle, CheckCircle2 } from "lucide-react";

export function ForensicDossier() {
  const { id } = useParams<{ id: string }>();
  const jobId = parseInt(id || "0", 10);

  const { data: job, isLoading: jobLoading } = trpc.jobs.get.useQuery(
    { id: jobId },
    { enabled: !!jobId }
  );

  const [dossierData, setDossierData] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateDossier = trpc.forensicDossier.generate.useMutation({
    onSuccess: (result) => {
      setDossierData(result.dossier);
      setGenerating(false);
      setError(null);
    },
    onError: (err) => {
      setError(err.message || "Failed to generate dossier");
      setGenerating(false);
    },
  });

  const handleGenerateDossier = async () => {
    if (!job) return;

    setGenerating(true);
    setError(null);

    try {
      await generateDossier.mutateAsync({
        jobId,
        propertyAddress: job.propertyAddress,
        insuredName: job.homeownerName || "Property Owner",
        adjusterName: job.adjusterName || "Adjuster",
        claimNumber: job.claimNumber || "N/A",
        lossType: "hail",
        dateOfLoss: job.dateOfLoss?.toISOString().split("T")[0] || new Date().toISOString().split("T")[0],
        roofArea: 3200,
        roofPitch: "6/12",
        damagePhotos: [],
        damageDescription: job.notes || "Storm damage to roof structure",
        estimatedDamageAmount: 8500,
        adjusterScopeNotes: "Standard roofing estimate provided",
        collateralDamages: [
          {
            type: "Attic Vents",
            description: "Damaged attic vents requiring replacement",
            estimatedCost: 450,
          },
          {
            type: "Pipe Flashing",
            description: "Compromised pipe flashing allowing water intrusion",
            estimatedCost: 350,
          },
          {
            type: "Interior Water Damage",
            description: "Water damage to ceiling and walls from roof penetration",
            estimatedCost: 2100,
          },
        ],
      });
    } catch (err) {
      setError("Failed to generate dossier. Please try again.");
    }
  };

  if (jobLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Claim not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Forensic Dossier</h1>
        <p className="text-muted-foreground mt-2">
          Generate a complete, adjuster-proof claim documentation package
        </p>
      </div>

      {/* Claim Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Claim Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Property Address</p>
            <p className="font-semibold">{job.propertyAddress}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Claim Number</p>
            <p className="font-semibold">{job.claimNumber || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Insured Name</p>
            <p className="font-semibold">{job.homeownerName || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Adjuster</p>
            <p className="font-semibold">{job.adjusterName || "N/A"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Generate Button */}
      {!dossierData && (
        <Card>
          <CardHeader>
            <CardTitle>Generate Forensic Dossier</CardTitle>
            <CardDescription>
              Create a comprehensive, adjuster-proof claim documentation package with building code justifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleGenerateDossier}
              disabled={generating}
              size="lg"
              className="w-full"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Dossier...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Forensic Dossier
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dossier Results */}
      {dossierData && (
        <div className="space-y-6">
          {/* Success Alert */}
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Forensic dossier generated successfully
            </AlertDescription>
          </Alert>

          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Total RCV</p>
                <p className="text-2xl font-bold">
                  ${dossierData.metrics?.totalRCV?.toLocaleString() || "0"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Depreciation</p>
                <p className="text-2xl font-bold">
                  ${dossierData.metrics?.totalDepreciation?.toLocaleString() || "0"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Net ACV</p>
                <p className="text-2xl font-bold text-green-600">
                  ${dossierData.metrics?.netACV?.toLocaleString() || "0"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Approval Rate</p>
                <p className="text-2xl font-bold text-blue-600">
                  {dossierData.metrics?.estimatedApprovalRate || "78%"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Dossier Content Tabs */}
          <Card>
            <CardHeader>
              <CardTitle>Dossier Content</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="codes">Building Codes</TabsTrigger>
                  <TabsTrigger value="waste">Waste Factors</TabsTrigger>
                  <TabsTrigger value="content">Full Report</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <p className="text-sm">
                      <strong>Claim Number:</strong> {dossierData.claimNumber}
                    </p>
                    <p className="text-sm">
                      <strong>Property:</strong> {dossierData.propertyAddress}
                    </p>
                    <p className="text-sm">
                      <strong>Insured:</strong> {dossierData.insuredName}
                    </p>
                    <p className="text-sm">
                      <strong>Adjuster:</strong> {dossierData.adjusterName}
                    </p>
                    <p className="text-sm">
                      <strong>Generated:</strong>{" "}
                      {new Date(dossierData.generatedAt).toLocaleString()}
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="codes" className="space-y-4">
                  <div className="space-y-3">
                    {Object.entries(dossierData.buildingCodesCited || {}).map(
                      ([code, description]: [string, unknown]) => (
                        <div key={code} className="border-l-4 border-primary pl-4">
                          <p className="font-semibold text-sm">{code}</p>
                          <p className="text-sm text-muted-foreground">{String(description)}</p>
                        </div>
                      )
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="waste" className="space-y-4">
                  <div className="space-y-3">
                    {Object.entries(dossierData.wasteFactors || {}).map(
                      ([material, factor]: [string, any]) => (
                        <div key={material} className="border p-3 rounded-lg">
                          <p className="font-semibold text-sm capitalize">
                            {material.replace(/_/g, " ")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {factor.min}-{factor.max}% waste factor
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {factor.reason}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="content" className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
                    <p className="text-sm whitespace-pre-wrap font-mono">
                      {dossierData.content?.substring(0, 2000)}...
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Download & Actions */}
          <div className="flex gap-4">
            <Button size="lg" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button size="lg" variant="outline" className="flex-1">
              <FileText className="w-4 h-4 mr-2" />
              Generate Demand Letter
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
