// Supplement Knowledge Base
// Contains all common supplement items with Xactimate codes, justifications, and code references.
// This is the core intelligence of the supplement detection engine.

export interface SupplementItem {
  id: string;
  xactimateCode: string;
  description: string;
  unit: string;
  category: string;
  commonlyMissed: boolean;
  justification: string;
  codeReference?: string;
  manufacturerReference?: string;
  detectionKeywords: string[]; // Keywords to look for (or NOT find) in parsed estimate
  estimatedUnitPrice: number; // Rough estimate for display
}

export const SUPPLEMENT_KNOWLEDGE_BASE: SupplementItem[] = [
  {
    id: "starter_shingles",
    xactimateCode: "RFG STRT",
    description: "Starter Course Shingles",
    unit: "LF",
    category: "Roofing Materials",
    commonlyMissed: true,
    justification:
      "Starter course shingles are a separate product from field shingles and cannot be substituted with field shingle waste. Xactimate has a distinct labor and material rate for starter installation. Factory-made starter strips (e.g., GAF Pro-Start, WeatherBlocker) are required by most shingle manufacturers at all eaves and rakes.",
    manufacturerReference: "GAF Pro-Start & WeatherBlocker Installation Instructions",
    detectionKeywords: ["starter", "RFG STRT", "starter strip", "starter course"],
    estimatedUnitPrice: 2.85,
  },
  {
    id: "ridge_cap",
    xactimateCode: "RFG RIDGCAP",
    description: "Ridge Cap Shingles (Enhanced)",
    unit: "LF",
    category: "Roofing Materials",
    commonlyMissed: true,
    justification:
      "Enhanced ridge cap shingles (e.g., GAF TimberTex, Z-Ridge, Seal-A-Ridge) are a distinct product from field shingles. They cannot be fabricated from architectural shingle waste as the material is too thick and will crack when bent. Xactimate prices ridge cap separately from field shingles.",
    manufacturerReference: "GAF TimberTex & Z-Ridge Installation Instructions",
    detectionKeywords: ["ridge cap", "RFG RIDGCAP", "hip cap", "ridge shingle"],
    estimatedUnitPrice: 5.5,
  },
  {
    id: "drip_edge_eaves",
    xactimateCode: "RFG DRIP",
    description: "Drip Edge - Eaves",
    unit: "LF",
    category: "Flashing",
    commonlyMissed: true,
    justification:
      "IRC Section R905.2.8.5 requires drip edge at eaves. New underlayment is installed over drip edge at eaves, requiring removal and replacement. Old fastener holes create leak risk. Profile must meet IRC 2-inch roof-leg requirement (2\"x2\" or 1\"x2\" minimum).",
    codeReference: "IRC R905.2.8.5",
    manufacturerReference: "GAF Roofing System Requirements - Drip Edge",
    detectionKeywords: ["drip edge", "RFG DRIP", "gutter apron", "eave metal"],
    estimatedUnitPrice: 3.15,
  },
  {
    id: "drip_edge_rakes",
    xactimateCode: "RFG DRIP",
    description: "Drip Edge - Rakes",
    unit: "LF",
    category: "Flashing",
    commonlyMissed: true,
    justification:
      "IRC Section R905.2.8.5 requires drip edge at both eaves AND rakes. Underlayment is installed under drip edge at rakes. Adjusters commonly only include eave drip edge. Rake drip edge must be replaced separately as new fasteners cannot reuse old holes.",
    codeReference: "IRC R905.2.8.5",
    manufacturerReference: "GAF Roofing System Requirements - Drip Edge",
    detectionKeywords: ["drip edge rake", "rake metal", "rake drip"],
    estimatedUnitPrice: 3.15,
  },
  {
    id: "valley_metal",
    xactimateCode: "RFG VMTL",
    description: "Valley Metal (W-Metal or Z-Metal)",
    unit: "LF",
    category: "Flashing",
    commonlyMissed: true,
    justification:
      "Valley metal cannot be reused. Field shingles are nailed through the valley liner, making reuse impossible without creating new nail holes and leak risk. Open valley metal must be replaced with new W-metal or Z-metal. Closed valleys require ice & water shield replacement.",
    codeReference: "IRC R905.2.8.2",
    detectionKeywords: ["valley", "RFG VMTL", "valley metal", "valley liner", "valley flashing"],
    estimatedUnitPrice: 4.25,
  },
  {
    id: "ice_water_shield",
    xactimateCode: "RFG ICEWATER",
    description: "Ice & Water Shield",
    unit: "SF",
    category: "Underlayment",
    commonlyMissed: true,
    justification:
      "IRC R905.1.2 requires ice barrier (ice & water shield) at eaves extending 24 inches inside the exterior wall line in areas subject to ice damming. Also required in valleys per manufacturer specifications. Cannot survive tear-off and must be replaced.",
    codeReference: "IRC R905.1.2, IRC R905.2.7",
    manufacturerReference: "GAF WeatherWatch & StormGuard Installation Instructions",
    detectionKeywords: ["ice water", "ice & water", "RFG ICEWATER", "ice barrier", "leak barrier"],
    estimatedUnitPrice: 0.85,
  },
  {
    id: "step_flashing",
    xactimateCode: "RFG STPFLSH",
    description: "Step Flashing",
    unit: "LF",
    category: "Flashing",
    commonlyMissed: true,
    justification:
      "Step flashing must be replaced when installing new shingles. Most shingle manufacturers require nailing step flashing to the roof deck, not the wall. Existing step flashing nailed to the wall is non-compliant with manufacturer requirements. Reuse creates leak risk at wall/roof intersections.",
    manufacturerReference: "GAF Roofing System Requirements - Step Flashing",
    detectionKeywords: ["step flashing", "RFG STPFLSH", "step flash"],
    estimatedUnitPrice: 3.75,
  },
  {
    id: "headwall_flashing",
    xactimateCode: "RFG HDWLFLSH",
    description: "Head Wall / End Wall Flashing",
    unit: "LF",
    category: "Flashing",
    commonlyMissed: true,
    justification:
      "Head wall and end wall flashing must be replaced. If existing flashing has shingles face-nailed to it, new shingles cannot reuse the same nail holes, creating leak potential. Replacement is required to maintain a watertight seal at wall/roof transitions.",
    detectionKeywords: ["headwall", "head wall", "end wall", "RFG HDWLFLSH", "endwall"],
    estimatedUnitPrice: 4.0,
  },
  {
    id: "pipe_boots",
    xactimateCode: "RFG FLPIPE",
    description: "Pipe Boot / Pipe Jack Flashing",
    unit: "EA",
    category: "Flashing",
    commonlyMissed: true,
    justification:
      "Lead pipe boots and pipe jack flashings must be replaced, not detached and reset. Lead is extremely soft and deforms permanently when bent during tear-off. Reuse creates leak risk at plumbing penetrations. Each pipe penetration requires a new boot per manufacturer specifications.",
    manufacturerReference: "GAF Pipe Boot Installation Guide",
    detectionKeywords: ["pipe", "pipe boot", "pipe jack", "RFG FLPIPE", "plumbing vent"],
    estimatedUnitPrice: 45.0,
  },
  {
    id: "chimney_flashing",
    xactimateCode: "RFG CHIMFLSH",
    description: "Chimney Flashing (Remove & Replace)",
    unit: "EA",
    category: "Flashing",
    commonlyMissed: false,
    justification:
      "Chimney flashing scope includes removing old apron and step flashing, installing new apron flashing, step flashing, counter flashing, and sealing. Chimneys wider than 30 inches require a cricket (saddle) per IRC R903.2.2 to divert water.",
    codeReference: "IRC R903.2.2",
    manufacturerReference: "GAF Chimney Flashing Installation Guide",
    detectionKeywords: ["chimney", "RFG CHIMFLSH", "chimney flashing"],
    estimatedUnitPrice: 385.0,
  },
  {
    id: "steep_slope",
    xactimateCode: "RFG STEEP",
    description: "Additional Charge - Steep Slope (>6:12 pitch)",
    unit: "SQ",
    category: "Labor Adjustments",
    commonlyMissed: false,
    justification:
      "Roofs with pitch greater than 6:12 require additional safety equipment, slower work pace, and increased labor time. Xactimate applies a steep slope adder per square for pitches exceeding 6:12. This is a standard line item that adjusters sometimes omit.",
    detectionKeywords: ["steep", "RFG STEEP", "steep slope", "steep charge"],
    estimatedUnitPrice: 28.5,
  },
  {
    id: "high_roof",
    xactimateCode: "RFG HIGH",
    description: "Additional Charge - High Roof (2+ stories)",
    unit: "SQ",
    category: "Labor Adjustments",
    commonlyMissed: false,
    justification:
      "Two-story and higher roofs require additional safety measures, longer material handling time, and increased labor costs. Xactimate applies a high roof adder per square for roofs 2 stories or higher.",
    detectionKeywords: ["high roof", "RFG HIGH", "2 story", "two story"],
    estimatedUnitPrice: 22.0,
  },
  {
    id: "felt_underlayment",
    xactimateCode: "RFG FELT30",
    description: "Underlayment - 30# Felt (Upgrade from 15#)",
    unit: "SQ",
    category: "Underlayment",
    commonlyMissed: false,
    justification:
      "If the original roof had 30# felt underlayment and the adjuster estimated 15# felt, a supplement is warranted to match the original material. 30# felt provides superior moisture protection and is required by some manufacturers for warranty compliance.",
    detectionKeywords: ["felt", "underlayment", "RFG FELT30", "RFG FELT15", "30 lb", "15 lb"],
    estimatedUnitPrice: 18.5,
  },
  {
    id: "permit",
    xactimateCode: "PERMIT",
    description: "Building Permit",
    unit: "EA",
    category: "Overhead",
    commonlyMissed: true,
    justification:
      "Most jurisdictions require a building permit for full roof replacement. Permit costs are a legitimate line item that adjusters frequently omit or list as $0 if-incurred. Actual permit costs vary by jurisdiction and should be verified with the local building department.",
    detectionKeywords: ["permit", "PERMIT", "building permit"],
    estimatedUnitPrice: 175.0,
  },
  {
    id: "dumpster",
    xactimateCode: "DUMPSTER",
    description: "Dumpster / Debris Removal",
    unit: "EA",
    category: "Overhead",
    commonlyMissed: false,
    justification:
      "Debris removal cost must account for actual weight of roofing material. Multiple layers of shingles significantly increase debris weight and may require additional dumpster pulls. Each trade (roofing, gutters) should carry its own debris removal line when there is no general contractor O&P.",
    detectionKeywords: ["dumpster", "DUMPSTER", "debris", "haul", "disposal"],
    estimatedUnitPrice: 450.0,
  },
  {
    id: "overhead_profit",
    xactimateCode: "O&P",
    description: "Overhead & Profit (10% + 10%)",
    unit: "PCT",
    category: "Overhead",
    commonlyMissed: true,
    justification:
      "When a general contractor is coordinating multiple trades (roofing, gutters, siding, etc.), overhead and profit (10% overhead + 10% profit) is a standard and legitimate line item. Adjusters frequently omit O&P when a GC is clearly required to coordinate the scope of work.",
    detectionKeywords: ["overhead", "profit", "O&P", "general contractor"],
    estimatedUnitPrice: 0,
  },
  {
    id: "detach_reset_gutters",
    xactimateCode: "GUT D&R",
    description: "Gutters - Detach & Reset",
    unit: "LF",
    category: "Detach & Reset",
    commonlyMissed: true,
    justification:
      "Gutters must be removed to properly install new drip edge at eaves and must be reset after roofing is complete. This is a separate operation from gutter replacement and is frequently omitted when gutters are being retained.",
    detectionKeywords: ["gutter", "GUT D&R", "detach reset gutter"],
    estimatedUnitPrice: 3.5,
  },
  {
    id: "satellite_dish",
    xactimateCode: "ELE D&R SAT",
    description: "Satellite Dish - Detach & Reset",
    unit: "EA",
    category: "Detach & Reset",
    commonlyMissed: false,
    justification:
      "Satellite dishes mounted on the roof must be detached before tear-off and reset after installation. This requires a qualified technician and is a legitimate supplement item when a satellite dish is present.",
    detectionKeywords: ["satellite", "ELE D&R SAT", "dish"],
    estimatedUnitPrice: 95.0,
  },
];

// Categories for the UI
export const SUPPLEMENT_CATEGORIES = [
  "Roofing Materials",
  "Flashing",
  "Underlayment",
  "Labor Adjustments",
  "Overhead",
  "Detach & Reset",
];

// Auto-detect missing items by comparing parsed estimate line items against knowledge base
export function detectMissingItems(parsedLineItems: Array<{ code?: string; description?: string }>): SupplementItem[] {
  const missing: SupplementItem[] = [];

  for (const item of SUPPLEMENT_KNOWLEDGE_BASE) {
    if (!item.commonlyMissed) continue;

    const found = parsedLineItems.some((li) => {
      const text = `${li.code || ""} ${li.description || ""}`.toLowerCase();
      return item.detectionKeywords.some((kw) => text.includes(kw.toLowerCase()));
    });

    if (!found) {
      missing.push(item);
    }
  }

  return missing;
}
