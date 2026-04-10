/**
 * Comprehensive roofing insurance claim photo checklist.
 * Based on industry standards from Xactimate, supplement specialists,
 * and carrier documentation requirements.
 *
 * Each item includes:
 *  - id: unique slug
 *  - category: grouping for display
 *  - label: short name shown in UI
 *  - required: whether missing this photo directly costs money
 *  - moneyAtRisk: dollar range lost if photo is missing
 *  - instruction: what to photograph and how
 *  - whyItMatters: plain-English explanation for contractors
 *  - tips: specific shooting tips
 */

export type PhotoChecklistItem = {
  id: string;
  category: string;
  categoryOrder: number;
  label: string;
  required: boolean;
  moneyAtRisk: string | null;
  instruction: string;
  whyItMatters: string;
  tips: string[];
};

export const PHOTO_CHECKLIST: PhotoChecklistItem[] = [
  // ─── A. Property Overview ──────────────────────────────────────────────────
  {
    id: "front_of_house",
    category: "Property Overview",
    categoryOrder: 1,
    label: "Front of House (Address Visible)",
    required: true,
    moneyAtRisk: null,
    instruction: "Stand at the street and photograph the full front of the house. Make sure the address numbers are visible.",
    whyItMatters: "Establishes property identity. Without this, carriers can dispute which property the claim belongs to.",
    tips: [
      "Shoot from across the street so the full structure is in frame",
      "If the address isn't on the house, include the mailbox or street sign",
      "Take in daylight — no flash needed",
    ],
  },
  {
    id: "elevation_front",
    category: "Property Overview",
    categoryOrder: 1,
    label: "Front Elevation",
    required: true,
    moneyAtRisk: null,
    instruction: "Full front face of the house showing the roof slope, gutters, soffits, and fascia.",
    whyItMatters: "Gives the adjuster context for the entire front slope and any visible storm damage.",
    tips: [
      "Back up far enough to capture the full roofline",
      "Include gutters and downspouts in frame",
    ],
  },
  {
    id: "elevation_rear",
    category: "Property Overview",
    categoryOrder: 1,
    label: "Rear Elevation",
    required: true,
    moneyAtRisk: null,
    instruction: "Full rear face of the house showing the roof slope, gutters, and any back-side features.",
    whyItMatters: "Rear slopes are often missed in adjuster scopes. Your photo proves they were inspected.",
    tips: ["Don't skip this — rear slopes are common supplement wins"],
  },
  {
    id: "elevation_left",
    category: "Property Overview",
    categoryOrder: 1,
    label: "Left Side Elevation",
    required: true,
    moneyAtRisk: null,
    instruction: "Full left side of the house from the ground.",
    whyItMatters: "Documents all four sides for a complete scope of loss.",
    tips: ["Include any visible step flashing or wall flashing in frame"],
  },
  {
    id: "elevation_right",
    category: "Property Overview",
    categoryOrder: 1,
    label: "Right Side Elevation",
    required: true,
    moneyAtRisk: null,
    instruction: "Full right side of the house from the ground.",
    whyItMatters: "Documents all four sides for a complete scope of loss.",
    tips: [],
  },

  // ─── B. Damage Documentation ───────────────────────────────────────────────
  {
    id: "hail_test_square",
    category: "Damage Documentation",
    categoryOrder: 2,
    label: "Hail Test Square (Each Slope)",
    required: true,
    moneyAtRisk: "$2,000–$8,000",
    instruction: "Draw a 10×10 chalk square on each slope. Photograph the square with a coin or ruler for scale. Count and circle every hail hit inside the square.",
    whyItMatters: "This is the single most important photo for hail claims. Without test squares, carriers can deny the entire claim or drastically reduce the scope.",
    tips: [
      "Use bright chalk — yellow or orange shows up best in photos",
      "Place a quarter next to each impact for scale",
      "Shoot straight down over the square, not at an angle",
      "Do a test square on EVERY slope — not just the worst one",
    ],
  },
  {
    id: "hail_impacts_closeup",
    category: "Damage Documentation",
    categoryOrder: 2,
    label: "Hail Impact Close-Ups (Granule Loss)",
    required: true,
    moneyAtRisk: "$1,500–$5,000",
    instruction: "Get within 12 inches of individual hail impacts. Show granule loss, exposed matting, and bruising. Place a coin next to each impact for scale.",
    whyItMatters: "Carriers need to see the actual damage, not just the test square. Close-ups prove functional damage, not just cosmetic.",
    tips: [
      "Use your phone's portrait mode or macro setting",
      "Natural light is better than flash for showing texture",
      "Capture at least 5–10 individual impacts across different slopes",
    ],
  },
  {
    id: "soft_metal_hits",
    category: "Damage Documentation",
    categoryOrder: 2,
    label: "Soft Metal Hail Hits (Gutters, Vents, Drip Edge)",
    required: true,
    moneyAtRisk: "$800–$3,000",
    instruction: "Photograph hail dents on gutters, downspouts, AC fins, vents, and drip edge. These are your corroborating evidence.",
    whyItMatters: "Soft metals don't lie. Adjusters use soft metal hits to confirm hail size and frequency. Without these, they can argue the roof damage is pre-existing.",
    tips: [
      "Shoot from multiple angles to show the dent depth",
      "Photograph the AC condenser fins if accessible",
      "Window screens with holes are gold — photograph them",
    ],
  },
  {
    id: "wind_creased_shingles",
    category: "Damage Documentation",
    categoryOrder: 2,
    label: "Wind-Creased or Torn Shingles",
    required: false,
    moneyAtRisk: "$1,000–$4,000",
    instruction: "Photograph shingles with wind creases, lifted tabs, torn edges, or missing sections. Show the direction of damage.",
    whyItMatters: "Wind damage requires directional evidence. Photos showing consistent damage direction prove storm causation.",
    tips: [
      "Show the crease line clearly — shoot perpendicular to it",
      "Photograph lifted shingles showing the broken seal",
      "Include ridge cap wind damage separately",
    ],
  },
  {
    id: "ridge_hip_damage",
    category: "Damage Documentation",
    categoryOrder: 2,
    label: "Ridge Cap & Hip Damage",
    required: true,
    moneyAtRisk: "$400–$1,500",
    instruction: "Walk the ridge and photograph damage to ridge cap shingles. Show hail hits, wind lifting, or missing caps.",
    whyItMatters: "Ridge caps are a common supplement item. Adjusters frequently miss them. Your photos prove they need replacement.",
    tips: [
      "Shoot along the ridge line to show the full run",
      "Close-up of individual damaged caps",
    ],
  },

  // ─── C. Starter Strip ──────────────────────────────────────────────────────
  {
    id: "starter_strip_eaves",
    category: "Starter Strip",
    categoryOrder: 3,
    label: "Starter Strip at Eaves (Lift Shingle to Show)",
    required: true,
    moneyAtRisk: "$300–$900",
    instruction: "At the eave edge, carefully lift the first course of shingles and photograph the starter strip underneath. Show the full width and condition.",
    whyItMatters: "Starter strip is one of the most commonly missed items on adjuster scopes. Without a photo proving it exists and needs replacement, you won't get paid for it.",
    tips: [
      "Lift gently — you just need to show the starter, not damage it",
      "Get close enough to show the adhesive strip on the starter",
      "Photograph 2–3 spots along the eave for documentation",
      "If there is NO starter strip, photograph that too — it's a code violation and a supplement item",
    ],
  },
  {
    id: "starter_strip_rakes",
    category: "Starter Strip",
    categoryOrder: 3,
    label: "Starter Strip at Rakes (Lift Shingle to Show)",
    required: true,
    moneyAtRisk: "$200–$600",
    instruction: "At both rake edges, lift the edge shingle and photograph the rake starter strip. Show condition and whether it is present.",
    whyItMatters: "Rake starters are separate from eave starters in Xactimate. Both need to be documented to get paid for both.",
    tips: [
      "Left rake and right rake — photograph both",
      "Show the full length of the rake starter if possible",
    ],
  },

  // ─── D. Drip Edge ──────────────────────────────────────────────────────────
  {
    id: "drip_edge_eaves",
    category: "Drip Edge",
    categoryOrder: 4,
    label: "Drip Edge at Eaves (Wide + Close-Up)",
    required: true,
    moneyAtRisk: "$400–$1,200",
    instruction: "Photograph the drip edge along the eaves. Take a wide shot showing the full run, then a close-up showing the material, condition, and any hail damage.",
    whyItMatters: "Drip edge is a code requirement on re-roofs and a consistent supplement item. Photos prove the existing material and justify replacement.",
    tips: [
      "Show the metal type (aluminum vs galvanized) if visible",
      "Hail dents on drip edge = automatic supplement item",
      "Photograph where drip edge is missing or improperly installed",
    ],
  },
  {
    id: "drip_edge_rakes",
    category: "Drip Edge",
    categoryOrder: 4,
    label: "Drip Edge at Rakes (Wide + Close-Up)",
    required: true,
    moneyAtRisk: "$300–$900",
    instruction: "Photograph the drip edge along both rake edges. Wide shot of the full run plus close-up of condition.",
    whyItMatters: "Rake drip edge is billed separately from eave drip edge in Xactimate. Both need documentation.",
    tips: ["Photograph both left and right rakes"],
  },

  // ─── E. Valleys ────────────────────────────────────────────────────────────
  {
    id: "valley_overview",
    category: "Valleys",
    categoryOrder: 5,
    label: "Valley Overview (Full Length)",
    required: true,
    moneyAtRisk: "$500–$2,000",
    instruction: "Photograph each valley from top to bottom showing the full length. Show whether it is open metal valley, closed cut, or woven.",
    whyItMatters: "Valley type determines the material and labor cost. Without documentation, adjusters default to the cheapest option.",
    tips: [
      "Stand at the bottom and shoot up the valley to show full length",
      "Identify the valley type clearly in your photo label",
    ],
  },
  {
    id: "valley_metal_condition",
    category: "Valleys",
    categoryOrder: 5,
    label: "Valley Metal Condition (Close-Up)",
    required: true,
    moneyAtRisk: "$600–$2,500",
    instruction: "Get close to the valley metal and photograph rust, corrosion, hail damage, or wear. Show the metal gauge and condition.",
    whyItMatters: "Rusted or damaged valley metal is a supplement item. Without close-up proof, adjusters will not approve replacement.",
    tips: [
      "Scratch the metal gently to check for rust underneath paint",
      "Hail dents in valley metal = strong supplement evidence",
      "Photograph both sides of the valley where shingles meet the metal",
    ],
  },

  // ─── F. Pipe Boots / Pipe Jacks ────────────────────────────────────────────
  {
    id: "pipe_boots_overview",
    category: "Pipe Boots & Penetrations",
    categoryOrder: 6,
    label: "All Pipe Boots (Overview Shot)",
    required: true,
    moneyAtRisk: "$150–$600 per boot",
    instruction: "Photograph all pipe boots/pipe jacks on the roof from a distance showing their location on each slope.",
    whyItMatters: "Pipe boots are frequently missed on adjuster scopes. An overview photo proves how many exist.",
    tips: ["Count them before you shoot — make sure all are visible in your photos"],
  },
  {
    id: "pipe_boots_closeup",
    category: "Pipe Boots & Penetrations",
    categoryOrder: 6,
    label: "Pipe Boot Condition Close-Ups",
    required: true,
    moneyAtRisk: "$150–$600 per boot",
    instruction: "Close-up of each pipe boot showing cracks, dry rot, improper fit, or hail damage to the rubber collar.",
    whyItMatters: "Cracked or deteriorated pipe boots are a code violation and supplement item. Close-ups prove the condition.",
    tips: [
      "Squeeze the rubber collar — if it cracks, photograph that",
      "Show any gaps between the boot and the pipe",
      "Hail dents on the metal flange = supplement item",
    ],
  },

  // ─── G. Step Flashing & Wall Flashing ─────────────────────────────────────
  {
    id: "step_flashing_wide",
    category: "Step Flashing & Wall Flashing",
    categoryOrder: 7,
    label: "Step Flashing at Walls (Wide Shot)",
    required: false,
    moneyAtRisk: "$400–$1,500",
    instruction: "Photograph the full run of step flashing where the roof meets a vertical wall. Show the entire length.",
    whyItMatters: "Step flashing is a major supplement item. The wide shot shows the scope of work required.",
    tips: ["Include the wall surface and the roof surface in the same frame"],
  },
  {
    id: "step_flashing_closeup",
    category: "Step Flashing & Wall Flashing",
    categoryOrder: 7,
    label: "Step Flashing Condition (Close-Up)",
    required: false,
    moneyAtRisk: "$400–$1,500",
    instruction: "Close-up of step flashing showing rust, improper installation, gaps, or hail damage.",
    whyItMatters: "Condition photos justify replacement vs. reuse. Adjusters will try to call it reusable without proof.",
    tips: ["Show where flashing is bent, rusted, or pulling away from the wall"],
  },
  {
    id: "chimney_flashing",
    category: "Step Flashing & Wall Flashing",
    categoryOrder: 7,
    label: "Chimney Flashing & Cricket",
    required: false,
    moneyAtRisk: "$600–$2,000",
    instruction: "Photograph all four sides of chimney flashing. If a cricket exists, photograph it separately.",
    whyItMatters: "Chimney flashing and crickets are high-dollar supplement items that adjusters routinely miss.",
    tips: [
      "Show the counter flashing and step flashing separately",
      "If there is no cricket on a wide chimney, that is a code violation — photograph it",
    ],
  },

  // ─── H. Underlayment & Decking ─────────────────────────────────────────────
  {
    id: "layer_count",
    category: "Underlayment & Decking",
    categoryOrder: 8,
    label: "Layer Count (Lift Edge to Show Layers)",
    required: true,
    moneyAtRisk: "$500–$2,000",
    instruction: "At the eave edge or a cut area, lift or peel back to show how many layers of shingles exist. Photograph clearly.",
    whyItMatters: "Multiple layers require additional tear-off labor and disposal. Without proof, adjusters will not pay for it.",
    tips: [
      "Use a pry bar at the eave to expose the layers",
      "Count and label in your photo: '2 layers visible'",
      "Photograph at multiple locations if layers vary",
    ],
  },
  {
    id: "decking_condition",
    category: "Underlayment & Decking",
    categoryOrder: 8,
    label: "Decking Condition (If Exposed)",
    required: false,
    moneyAtRisk: "$200–$800 per sheet",
    instruction: "If decking is exposed during tear-off, photograph any rot, delamination, soft spots, or water damage. Include a probe photo if safe.",
    whyItMatters: "Damaged decking is a supplement item. Without photos taken during tear-off, you cannot prove it after the fact.",
    tips: [
      "Photograph before replacing — you cannot supplement what you already covered",
      "Use a screwdriver probe to show soft spots — photograph the probe going in",
      "Mark damaged sheets with chalk and photograph the marked area",
    ],
  },

  // ─── I. Ventilation ────────────────────────────────────────────────────────
  {
    id: "ridge_vents",
    category: "Ventilation",
    categoryOrder: 9,
    label: "Ridge Vents (Type & Condition)",
    required: true,
    moneyAtRisk: "$300–$1,000",
    instruction: "Photograph all ridge vents showing type (shingle-over vs. aluminum cap), quantity, and condition.",
    whyItMatters: "Ridge vent type determines the Xactimate line item. Wrong identification = wrong payment.",
    tips: ["Show the full ridge vent run, not just one section"],
  },
  {
    id: "box_vents",
    category: "Ventilation",
    categoryOrder: 9,
    label: "Box Vents / Turtle Vents (Count & Condition)",
    required: true,
    moneyAtRisk: "$100–$400 per vent",
    instruction: "Photograph all box vents showing their location, quantity, and any hail damage.",
    whyItMatters: "Each vent is a separate line item. Without photos showing the count, adjusters will undercount.",
    tips: [
      "Photograph hail dents on the vent louvers",
      "Count all vents and make sure all are visible in your photos",
    ],
  },
  {
    id: "soffit_vents",
    category: "Ventilation",
    categoryOrder: 9,
    label: "Soffit Intake Vents",
    required: false,
    moneyAtRisk: "$200–$600",
    instruction: "Photograph soffit vents showing type (continuous vs. individual) and condition.",
    whyItMatters: "Soffit vent documentation supports ventilation calculations and any required upgrades.",
    tips: [],
  },

  // ─── J. Access & Safety ────────────────────────────────────────────────────
  {
    id: "pitch_gauge",
    category: "Access & Safety",
    categoryOrder: 10,
    label: "Pitch Gauge / Slope Measurement",
    required: true,
    moneyAtRisk: "$500–$3,000",
    instruction: "Photograph your pitch gauge on the steepest slope. Show the reading clearly. If using a measurement report, photograph the pitch data.",
    whyItMatters: "Steep slopes (7/12+) trigger steep charge multipliers in Xactimate. Without proof, adjusters default to flat pricing.",
    tips: [
      "7/12 and above = steep charge",
      "10/12 and above = high steep charge",
      "Photograph the gauge on the actual roof surface, not from the ground",
    ],
  },
  {
    id: "story_height",
    category: "Access & Safety",
    categoryOrder: 10,
    label: "Story Height (From Ground)",
    required: false,
    moneyAtRisk: "$300–$1,500",
    instruction: "Photograph the full height of the house from the ground, showing the number of stories clearly.",
    whyItMatters: "Two-story and three-story homes have access multipliers. Without documentation, adjusters will not pay them.",
    tips: ["Include a person in the photo for scale if possible"],
  },
  {
    id: "access_constraints",
    category: "Access & Safety",
    categoryOrder: 10,
    label: "Access Constraints (Fences, Power Lines, Landscaping)",
    required: false,
    moneyAtRisk: "$200–$800",
    instruction: "Photograph any obstacles that make roof access difficult: fences, power lines, mature trees, narrow gates.",
    whyItMatters: "Access difficulties justify additional labor charges. Without photos, adjusters will not approve them.",
    tips: [],
  },

  // ─── K. Detach & Reset ─────────────────────────────────────────────────────
  {
    id: "satellite_dish",
    category: "Detach & Reset",
    categoryOrder: 11,
    label: "Satellite Dish & Mount",
    required: false,
    moneyAtRisk: "$150–$400",
    instruction: "Photograph the satellite dish and its roof mount showing the attachment points and fasteners.",
    whyItMatters: "D&R items require proof they exist and are attached to the roof. Without photos, adjusters will not approve detach and reset.",
    tips: ["Show the lag bolts going into the roof deck"],
  },
  {
    id: "solar_panels",
    category: "Detach & Reset",
    categoryOrder: 11,
    label: "Solar Panels & Conduit",
    required: false,
    moneyAtRisk: "$500–$3,000+",
    instruction: "Photograph all solar panels, their mounting hardware, conduit runs, and roof penetrations.",
    whyItMatters: "Solar panel D&R is one of the highest-dollar supplement items. Thorough documentation is critical.",
    tips: [
      "Photograph the full conduit route from panels to the electrical box",
      "Show all roof penetrations and mounting feet",
      "Count the panels and make sure all are in your photos",
    ],
  },
  {
    id: "gutters_downspouts",
    category: "Detach & Reset",
    categoryOrder: 11,
    label: "Gutters & Downspouts (Hail Damage)",
    required: true,
    moneyAtRisk: "$400–$2,000",
    instruction: "Photograph hail dents in gutters and downspouts. Show the full gutter run and close-ups of individual dents.",
    whyItMatters: "Gutters are a major supplement item. Hail dents in gutters corroborate roof damage and are often missed by adjusters.",
    tips: [
      "Run your hand along the gutter — dents you can feel but not see still photograph well",
      "Photograph the inside of the gutter if it has granule accumulation",
      "Downspout dents are easy to photograph and hard for adjusters to dispute",
    ],
  },
];

export const PHOTO_CATEGORIES = [
  "Property Overview",
  "Damage Documentation",
  "Starter Strip",
  "Drip Edge",
  "Valleys",
  "Pipe Boots & Penetrations",
  "Step Flashing & Wall Flashing",
  "Underlayment & Decking",
  "Ventilation",
  "Access & Safety",
  "Detach & Reset",
];

export const REQUIRED_PHOTO_IDS = PHOTO_CHECKLIST.filter((p) => p.required).map((p) => p.id);
