import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  FileText,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Camera,
  Zap,
  Droplet,
  Hammer,
  Calendar,
  MapPin,
  Loader2,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface DossierViewerProps {
  jobId: number;
  onGeneratePDF?: () => void;
}

export function DossierViewer({ jobId, onGeneratePDF }: DossierViewerProps) {
  const [activeSection, setActiveSection] = useState("overview");
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: titleSlide } = trpc.dossier.getTitleSlide.useQuery({ jobId });
  const { data: claimMetadata } = trpc.dossier.getClaimMetadata.useQuery({ jobId });
  const { data: financialResolution } = trpc.dossier.getFinancialResolution.useQuery({ jobId });
  const { data: manufacturerMandates } = trpc.dossier.getManufacturerMandates.useQuery({ jobId });
  const { data: wasteFactors } = trpc.dossier.getWasteFactors.useQuery({ jobId });
  const { data: scopeBreakdown } = trpc.dossier.getScopeBreakdown.useQuery({ jobId });
  const { data: itemizedCosts } = trpc.dossier.getItemizedCosts.useQuery({ jobId });
  const { data: collateralFailures } = trpc.dossier.getCollateralFailures.useQuery({ jobId });
  const { data: waterIntrusion } = trpc.dossier.getWaterIntrusion.useQuery({ jobId });
  const { data: nailFailure } = trpc.dossier.getNailFailure.useQuery({ jobId });
  const { data: deckingDeficiency } = trpc.dossier.getDeckingDeficiency.useQuery({ jobId });
  const { data: timeline } = trpc.dossier.getTimeline.useQuery({ jobId });
  const { data: propertyMeasurements } = trpc.dossier.getPropertyMeasurements.useQuery({ jobId });
  const { data: finalAuthorization } = trpc.dossier.getFinalAuthorization.useQuery({ jobId });

  const generateFullDossier = trpc.dossier.generateFullDossier.useMutation({
    onSuccess: () => {
      toast.success("Dossier generated successfully!");
      setIsGenerating(false);
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
      setIsGenerating(false);
    },
  });

  const handleGenerateDossier = async () => {
    setIsGenerating(true);
    await generateFullDossier.mutateAsync({ jobId });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Forensic Compliance Blueprint</h2>
          <p className="text-sm text-muted-foreground">14-section professional dossier</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleGenerateDossier}
            disabled={isGenerating}
            className="gap-2"
            size="sm"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Generate Dossier
              </>
            )}
          </Button>
          <Button onClick={onGeneratePDF} variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
        <TabsList className="grid w-full grid-cols-7 lg:grid-cols-14">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="financial" className="text-xs">Financial</TabsTrigger>
          <TabsTrigger value="mandates" className="text-xs">Mandates</TabsTrigger>
          <TabsTrigger value="waste" className="text-xs">Waste</TabsTrigger>
          <TabsTrigger value="scope" className="text-xs">Scope</TabsTrigger>
          <TabsTrigger value="costs" className="text-xs">Costs</TabsTrigger>
          <TabsTrigger value="collateral" className="text-xs">Collateral</TabsTrigger>
          <TabsTrigger value="water" className="text-xs">Water</TabsTrigger>
          <TabsTrigger value="nail" className="text-xs">Nail</TabsTrigger>
          <TabsTrigger value="decking" className="text-xs">Decking</TabsTrigger>
          <TabsTrigger value="timeline" className="text-xs">Timeline</TabsTrigger>
          <TabsTrigger value="measurements" className="text-xs">Measurements</TabsTrigger>
          <TabsTrigger value="authorization" className="text-xs">Authorization</TabsTrigger>
        </TabsList>

        {/* SECTION 1: OVERVIEW */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Claim Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {titleSlide && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Property Address</p>
                    <p className="font-semibold">{titleSlide.propertyAddress}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Insured Name</p>
                    <p className="font-semibold">{titleSlide.insuredName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Claim Number</p>
                    <p className="font-semibold">{titleSlide.claimNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Adjuster</p>
                    <p className="font-semibold">{titleSlide.adjusterName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Type of Loss</p>
                    <p className="font-semibold">{titleSlide.typeOfLoss}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Date of Loss</p>
                    <p className="font-semibold">
                      {titleSlide.dateOfLoss
                        ? new Date(titleSlide.dateOfLoss).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECTION 3: FINANCIAL RESOLUTION */}
        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Financial Resolution Required
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {financialResolution && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs text-blue-600 font-semibold">RCV</p>
                      <p className="text-2xl font-bold text-blue-900">
                        ${financialResolution.replacementCostValue?.toFixed(2) || "0.00"}
                      </p>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-xs text-amber-600 font-semibold">Depreciation</p>
                      <p className="text-2xl font-bold text-amber-900">
                        -${financialResolution.depreciation?.toFixed(2) || "0.00"}
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-xs text-green-600 font-semibold">ACV</p>
                      <p className="text-2xl font-bold text-green-900">
                        ${financialResolution.actualCashValue?.toFixed(2) || "0.00"}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm whitespace-pre-wrap">{financialResolution.summary}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECTION 4: MANUFACTURER MANDATES */}
        <TabsContent value="mandates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Manufacturer Warranty Mandates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {manufacturerMandates?.mandates?.map((mandate, idx) => (
                <div key={idx} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold">{mandate.manufacturer}</h4>
                    <Badge variant="outline">{mandate.manufacturer}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{mandate.mandate}</p>
                  <div className="p-2 bg-blue-50 rounded text-sm">
                    <strong>Compliance:</strong> {mandate.compliance}
                  </div>
                  <div className="p-2 bg-red-50 rounded text-sm">
                    <strong>Consequence:</strong> {mandate.consequence}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECTION 5: WASTE FACTORS */}
        <TabsContent value="waste" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Waste Factor Justification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {wasteFactors?.wasteFactors?.map((factor, idx) => (
                <div key={idx} className="p-3 border rounded-lg">
                  <p className="font-semibold text-sm">{factor.material}</p>
                  <p className="text-sm text-muted-foreground">{factor.justification}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECTION 6: SCOPE BREAKDOWN */}
        <TabsContent value="scope" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scope of Work Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {scopeBreakdown && (
                <>
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-600 font-semibold">Total Scope</p>
                    <p className="text-3xl font-bold text-blue-900">
                      ${scopeBreakdown.totalScopeOfWork?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {scopeBreakdown.breakdown?.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded">
                        <span className="font-medium">{item.category}</span>
                        <div className="text-right">
                          <p className="font-semibold">${item.amount?.toFixed(2) || "0.00"}</p>
                          <p className="text-xs text-muted-foreground">{item.percentage}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECTION 7: ITEMIZED COSTS */}
        <TabsContent value="costs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Itemized Cost Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">Code</th>
                      <th className="text-left py-2 px-2">Description</th>
                      <th className="text-right py-2 px-2">Qty</th>
                      <th className="text-right py-2 px-2">Unit</th>
                      <th className="text-right py-2 px-2">Price</th>
                      <th className="text-right py-2 px-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemizedCosts?.lineItems?.map((item, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-2 font-mono text-xs">{item.code}</td>
                        <td className="py-2 px-2 text-xs">{item.description}</td>
                        <td className="py-2 px-2 text-right text-xs">{item.quantity}</td>
                        <td className="py-2 px-2 text-right text-xs">{item.unit}</td>
                        <td className="py-2 px-2 text-right text-xs">${item.unitPrice?.toFixed(2)}</td>
                        <td className="py-2 px-2 text-right text-xs font-semibold">
                          ${item.totalPrice?.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 p-3 bg-gray-100 rounded font-semibold text-right">
                Total: ${itemizedCosts?.total?.toFixed(2) || "0.00"}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECTION 8: COLLATERAL FAILURES */}
        <TabsContent value="collateral" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Collateral Component Failures
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {collateralFailures?.failures?.map((failure, idx) => (
                <div key={idx} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold">{failure.component}</h4>
                    <Badge variant="destructive">{failure.cost}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{failure.issue}</p>
                  {failure.photos && failure.photos.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {failure.photos.map((photo) => (
                        <img
                          key={photo.id}
                          src={photo.url}
                          alt={photo.label || "Evidence"}
                          className="w-20 h-20 object-cover rounded border"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECTION 9: WATER INTRUSION */}
        <TabsContent value="water" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplet className="w-5 h-5" />
                Water Intrusion & Interior Mitigation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {waterIntrusion && (
                <>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-semibold text-blue-900">{waterIntrusion.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Cost</p>
                      <p className="text-2xl font-bold">${waterIntrusion.cost}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Details</p>
                      <p className="text-sm">{waterIntrusion.details}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECTION 10: NAIL FAILURE */}
        <TabsContent value="nail" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hammer className="w-5 h-5" />
                Nail Failure Mechanism
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {nailFailure && (
                <>
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 space-y-2">
                    <p className="font-semibold text-sm">Physics of Failure</p>
                    <p className="text-sm text-amber-900">{nailFailure.physics}</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200 space-y-2">
                    <p className="font-semibold text-sm">The Hazard</p>
                    <p className="text-sm text-red-900">{nailFailure.hazard}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200 space-y-2">
                    <p className="font-semibold text-sm">Conclusion</p>
                    <p className="text-sm text-green-900">{nailFailure.conclusion}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECTION 11: DECKING DEFICIENCY */}
        <TabsContent value="decking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Decking Gap & Structural Deficiency</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {deckingDeficiency && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg space-y-2">
                      <p className="font-semibold text-sm">Existing Condition</p>
                      <p className="text-sm text-muted-foreground">{deckingDeficiency.existingCondition}</p>
                    </div>
                    <div className="p-4 border rounded-lg space-y-2">
                      <p className="font-semibold text-sm">Required Standard</p>
                      <p className="text-sm text-muted-foreground">{deckingDeficiency.requiredStandard}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-600 font-semibold">Cost</p>
                    <p className="text-2xl font-bold text-blue-900">${deckingDeficiency.cost}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECTION 12: TIMELINE */}
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Timeline: Integrity Compromise & Triggering Peril
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {timeline?.events?.map((event, idx) => (
                <div key={idx} className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{event.event}</p>
                      <p className="text-sm text-muted-foreground">{event.date}</p>
                    </div>
                  </div>
                  <p className="text-sm mt-2">{event.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECTION 13: MEASUREMENTS */}
        <TabsContent value="measurements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Property Measurements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {propertyMeasurements && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-xs text-muted-foreground">Total Roof Area</p>
                    <p className="text-2xl font-bold">{propertyMeasurements.totalRoofArea} sq ft</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-xs text-muted-foreground">Predominant Pitch</p>
                    <p className="text-2xl font-bold">{propertyMeasurements.predominantPitch}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-xs text-muted-foreground">Complexity</p>
                    <p className="text-2xl font-bold">{propertyMeasurements.complexity}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-xs text-muted-foreground">Facets</p>
                    <p className="text-2xl font-bold">{propertyMeasurements.facets}</p>
                  </div>
                  <div className="col-span-2 p-4 border rounded-lg space-y-2">
                    <p className="font-semibold text-sm">Perimeter</p>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>Eaves: {propertyMeasurements.perimeter?.eaves}</div>
                      <div>Rakes: {propertyMeasurements.perimeter?.rakes}</div>
                      <div>Ridges: {propertyMeasurements.perimeter?.ridges}</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECTION 14: FINAL AUTHORIZATION */}
        <TabsContent value="authorization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Final Claim Authorization Request
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {finalAuthorization && (
                <>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200 space-y-2">
                    <p className="font-semibold text-green-900">{finalAuthorization.property}</p>
                    <p className="text-sm text-green-800">{finalAuthorization.recommendation}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 border rounded text-center">
                      <p className="text-xs text-muted-foreground">RCV</p>
                      <p className="font-bold">${finalAuthorization.rcv?.toFixed(2)}</p>
                    </div>
                    <div className="p-3 border rounded text-center">
                      <p className="text-xs text-muted-foreground">Depreciation</p>
                      <p className="font-bold">-${finalAuthorization.depreciation?.toFixed(2)}</p>
                    </div>
                    <div className="p-3 border rounded text-center">
                      <p className="text-xs text-muted-foreground">ACV</p>
                      <p className="font-bold">${finalAuthorization.acv?.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-sm">Next Steps</p>
                    <ul className="space-y-1">
                      {finalAuthorization.nextSteps?.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
