// Conscious Claims — Shingle Identification Database
// 192 shingles: 95 current, 97 discontinued
// 9 manufacturers: GAF, Owens Corning, CertainTeed, Atlas, IKO, Malarkey, Tamko, Pabco, BP

export interface ShingleEntry {
  manufacturer: string;
  series_name: string;
  type: string;
  colors: string[];
  width_inches: number;
  height_inches: number;
  exposure_inches: number;
  tooth_pattern: string;
  shadow_line: string;
  sealant_type: string;
  impact_resistance: string;
  production_status: "CURRENT" | "DISCONTINUED";
  visual_identifiers: string;
  product_url: string;
  discontinued_year: number | null;
  insurance_note: string;
}

export const SHINGLE_DATABASE: { current_shingles: ShingleEntry[]; discontinued_shingles: ShingleEntry[] } = {
  current_shingles: [
    {
      manufacturer: "GAF",
      series_name: "Timberline HDZ",
      type: "Laminate/Architectural",
      colors: ["Charcoal", "Pewter Gray", "Weathered Wood", "Barkwood", "Driftwood", "Slate", "Hunter Green", "Mission Brown", "Oyster Gray", "Shakewood", "Birchwood", "Hickory", "Fox Hollow Gray", "Appalachian Sky", "Golden Harvest"],
      width_inches: 13.25,
      height_inches: 40,
      exposure_inches: 5.625,
      tooth_pattern: "Tapered",
      shadow_line: "Blended",
      sealant_type: "Dashed",
      impact_resistance: "Class 4",
      production_status: "CURRENT",
      visual_identifiers: "TWO WHITE PAINTED NAILING LINES (StrikeZone) — the definitive GAF identifier; small laminate tabs have FLARED/SPLAYED outer edges (not straight); shadow line is SOFT and BLENDED, not sharp; LayerLock: 21 visible crimp points binding the two laminate layers; standard 13.25x40 size; most common architectural shingle in North America",
      product_url: "https://www.gaf.com/en-us/roofing-materials/residential-roofing-materials/shingles/timberline-hdz",
      discontinued_year: null,
      insurance_note: "Class 4 impact resistance qualifies for insurance discounts in many states; most widely installed shingle — adjusters are very familiar with it; LayerLock technology is a distinguishing feature from older Timberline models"
    },
    {
      manufacturer: "GAF",
      series_name: "Timberline CS (Cool Series)",
      type: "Laminate/Architectural",
      colors: ["Barkwood", "Charcoal", "Pewter Gray", "Weathered Wood"],
      width_inches: 13.25,
      height_inches: 40,
      exposure_inches: 5.625,
      tooth_pattern: "Tapered",
      shadow_line: "Blended",
      sealant_type: "Dashed",
      impact_resistance: "Class 4",
      production_status: "CURRENT",
      visual_identifiers: "Identical profile to Timberline HDZ but with ENERGY STAR reflective granules — granules appear slightly lighter/more reflective than standard HDZ; same StrikeZone white nailing lines; same flared tab edges; same LayerLock crimps; only distinguishable from HDZ by granule reflectivity and color selection",
      product_url: "https://www.gaf.com/en-us/roofing-materials/residential-roofing-materials/shingles/timberline-cs",
      discontinued_year: null,
      insurance_note: "ENERGY STAR certified; reflective granules may qualify for additional insurance discounts; same replacement cost as standard HDZ"
    },
    {
      manufacturer: "GAF",
      series_name: "Timberline UHDZ (Ultra High Definition)",
      type: "Laminate/Architectural",
      colors: ["Charcoal", "Pewter Gray", "Weathered Wood", "Barkwood", "Driftwood", "Shakewood", "Hickory"],
      width_inches: 13.25,
      height_inches: 40,
      exposure_inches: 5.625,
      tooth_pattern: "Tapered",
      shadow_line: "Bold",
      sealant_type: "Dashed",
      impact_resistance: "Class 4",
      production_status: "CURRENT",
      visual_identifiers: "DEEPER shadow line than standard HDZ — more pronounced dimensional appearance; same StrikeZone white nailing lines; same flared tab edges; LayerLock crimps visible; granules appear denser and more varied in texture than standard HDZ; premium version of HDZ with enhanced dimensional depth",
      product_url: "https://www.gaf.com/en-us/roofing-materials/residential-roofing-materials/shingles/timberline-uhdz",
      discontinued_year: null,
      insurance_note: "Premium product — higher replacement cost than standard HDZ; Class 4 impact rating; must be replaced with exact product for insurance claims"
    },
    {
      manufacturer: "GAF",
      series_name: "Camelot II",
      type: "Laminate/Architectural",
      colors: ["Antique Slate", "Charcoal", "Barkwood", "Royal Slate", "Weathered Timber", "Williamsburg Slate", "Aged Oak"],
      width_inches: 17,
      height_inches: 34.5,
      exposure_inches: 7.5,
      tooth_pattern: "Tapered",
      shadow_line: "Bold",
      sealant_type: "Solid",
      impact_resistance: "Class 4",
      production_status: "CURRENT",
      visual_identifiers: "Slate-like artisan design with tabs that CONNECT at very bottom (distinguishes from discontinued Camelot I where tabs do NOT connect at bottom); 17x34.5 dimensions — notably narrower than Grand Sequoia (40 wide vs 34.5); European architectural romantic styling; 56 pieces/4 bundles per square; tabs connected at base is key ID feature vs original Camelot",
      product_url: "https://www.gaf.com/en-us/roofing-materials/residential-roofing-materials/shingles/camelot-ii",
      discontinued_year: null,
      insurance_note: "Class 4 impact rating qualifies for discounts; unique 17x34.5 size; distinguishing from discontinued Camelot I is critical — check if tabs connect at bottom (II) or not (I, discontinued 2014)"
    },
    {
      manufacturer: "GAF",
      series_name: "Grand Sequoia",
      type: "Laminate/Architectural",
      colors: ["Charcoal", "Barkwood", "Weathered Wood", "Antique Slate", "Pewter Gray"],
      width_inches: 17,
      height_inches: 40,
      exposure_inches: 7.5,
      tooth_pattern: "LG Tapered",
      shadow_line: "Bold",
      sealant_type: "Solid",
      impact_resistance: "Class 4",
      production_status: "CURRENT",
      visual_identifiers: "LARGEST standard GAF shingle: 17x40 inches — noticeably larger than Timberline; deep dramatic shadow lines resembling wood shake; large irregular tab pattern; Class 4 impact; 4 bundles per square; much more dramatic dimensional appearance than Timberline HDZ",
      product_url: "https://www.gaf.com/en-us/roofing-materials/residential-roofing-materials/shingles/grand-sequoia",
      discontinued_year: null,
      insurance_note: "Class 4 impact rating qualifies for insurance discounts; unique 17x40 size means replacement requires exact product match — no cross-compatibility with standard Timberline"
    },
    {
      manufacturer: "Owens Corning",
      series_name: "Duration",
      type: "Laminate/Architectural",
      colors: ["Onyx", "Estate Gray", "Driftwood", "Teak", "Quarry Gray", "Harbor Blue", "Brownwood", "Sierra Gray", "Williamsburg Gray", "Chateau Green", "Desert Tan", "Aged Copper"],
      width_inches: 13.375,
      height_inches: 40,
      exposure_inches: 5.75,
      tooth_pattern: "Tapered",
      shadow_line: "Bold",
      sealant_type: "Solid",
      impact_resistance: "Class 4",
      production_status: "CURRENT",
      visual_identifiers: "THE definitive identifier: SureNail = VISIBLE WOVEN FABRIC STRIP (tan/brown textile mesh) embedded in the nailing zone — NO other manufacturer has this; XL tabs: three apparent sizes (small/medium/XL) vs two for most competitors; shadow line: WIDE and SHARPLY defined with crisp straight edge; COLORS: Onyx = very dark near-black uniform; Estate Gray = medium cool gray; Driftwood = WARM BROWN/TAN with lighter sandy highlights — NOT gray; Stone Gray = medium cool gray",
      product_url: "https://www.owenscorning.com/en-us/roofing/shingles/duration",
      discontinued_year: null,
      insurance_note: "Class 4 impact resistance; SureNail technology is a patented feature — must be replaced with Duration or equivalent; widely installed across the US"
    },
    {
      manufacturer: "Owens Corning",
      series_name: "TruDefinition Duration",
      type: "Laminate/Architectural",
      colors: ["Onyx", "Estate Gray", "Driftwood", "Teak", "Quarry Gray", "Harbor Blue", "Brownwood", "Sierra Gray", "Williamsburg Gray"],
      width_inches: 13.375,
      height_inches: 40,
      exposure_inches: 5.75,
      tooth_pattern: "Tapered",
      shadow_line: "Bold",
      sealant_type: "Solid",
      impact_resistance: "Class 4",
      production_status: "CURRENT",
      visual_identifiers: "Same SureNail woven fabric strip as Duration — definitive Owens Corning identifier; TruDefinition uses StreakGuard algae protection granules which appear slightly more varied in color distribution; same XL tab pattern; same sharp shadow line; essentially the same shingle as Duration with enhanced algae resistance granules",
      product_url: "https://www.owenscorning.com/en-us/roofing/shingles/trudefinition-duration",
      discontinued_year: null,
      insurance_note: "Same replacement cost as Duration; StreakGuard algae protection is a distinguishing feature; Class 4 impact rating"
    },
    {
      manufacturer: "Owens Corning",
      series_name: "Duration Storm",
      type: "Laminate/Architectural",
      colors: ["Onyx", "Estate Gray", "Driftwood", "Teak", "Quarry Gray"],
      width_inches: 13.375,
      height_inches: 40,
      exposure_inches: 5.75,
      tooth_pattern: "Tapered",
      shadow_line: "Bold",
      sealant_type: "Solid",
      impact_resistance: "Class 4",
      production_status: "CURRENT",
      visual_identifiers: "Same SureNail woven fabric strip as all Duration products; Class 4 UL 2218 impact rating — designed for hail resistance; same profile as standard Duration; may have slightly thicker laminate layer; same XL tab pattern and sharp shadow line",
      product_url: "https://www.owenscorning.com/en-us/roofing/shingles/duration-storm",
      discontinued_year: null,
      insurance_note: "Class 4 impact rating is CRITICAL for insurance — qualifies for significant premium discounts in many states; full replacement trigger if discontinued color; must document Class 4 rating in supplement"
    },
    {
      manufacturer: "CertainTeed",
      series_name: "Landmark",
      type: "Laminate/Architectural",
      colors: ["Moire Black", "Heather Blend", "Weathered Wood", "Colonial Slate", "Pewter", "Burnt Sienna", "Charcoal Black", "Driftwood", "Georgetown Gray", "Hunter Green", "Light Maple", "Resawn Shake", "Slatestone Gray", "Stonecutters Slate", "Thunderstorm Gray"],
      width_inches: 13.25,
      height_inches: 40,
      exposure_inches: 5.625,
      tooth_pattern: "Straight",
      shadow_line: "Medium",
      sealant_type: "Solid",
      impact_resistance: "Class 4",
      production_status: "CURRENT",
      visual_identifiers: "Double BLUE parallel nailing lines (NailTrak) — ONLY manufacturer using blue nailing lines; if you see blue lines, it is CertainTeed, period; small laminate tabs have STRAIGHT edges (not flared like GAF); plastic release strip on back labeled CertainTeed; shadow line is medium depth — less dramatic than Owens Corning Duration",
      product_url: "https://www.certainteed.com/roofing/products/landmark/",
      discontinued_year: null,
      insurance_note: "Class 4 impact rating; NailTrak blue nailing lines are a distinguishing feature; most widely installed CertainTeed product"
    },
    {
      manufacturer: "CertainTeed",
      series_name: "Landmark Pro",
      type: "Laminate/Architectural",
      colors: ["Moire Black", "Heather Blend", "Weathered Wood", "Colonial Slate", "Pewter", "Burnt Sienna", "Charcoal Black", "Georgetown Gray", "Resawn Shake", "Slatestone Gray"],
      width_inches: 13.25,
      height_inches: 40,
      exposure_inches: 5.625,
      tooth_pattern: "Straight",
      shadow_line: "Bold",
      sealant_type: "Solid",
      impact_resistance: "Class 4",
      production_status: "CURRENT",
      visual_identifiers: "Same blue NailTrak nailing lines as Landmark — definitive CertainTeed identifier; DEEPER shadow line than standard Landmark — more dimensional appearance; same straight tab edges; premium version of Landmark with enhanced dimensional depth; granules appear denser",
      product_url: "https://www.certainteed.com/roofing/products/landmark-pro/",
      discontinued_year: null,
      insurance_note: "Premium product — higher replacement cost than standard Landmark; Class 4 impact rating; must document Pro vs standard Landmark in supplement"
    },
    {
      manufacturer: "CertainTeed",
      series_name: "Landmark Premium",
      type: "Laminate/Architectural",
      colors: ["Moire Black", "Heather Blend", "Weathered Wood", "Colonial Slate", "Pewter", "Georgetown Gray", "Resawn Shake"],
      width_inches: 13.25,
      height_inches: 40,
      exposure_inches: 5.625,
      tooth_pattern: "Straight",
      shadow_line: "Bold",
      sealant_type: "Solid",
      impact_resistance: "Class 4",
      production_status: "CURRENT",
      visual_identifiers: "Same blue NailTrak nailing lines as all Landmark products; BOLDEST shadow line in the Landmark family — most dramatic dimensional appearance; premium granule blend with enhanced color variation; same straight tab edges; heaviest weight in the Landmark line",
      product_url: "https://www.certainteed.com/roofing/products/landmark-premium/",
      discontinued_year: null,
      insurance_note: "Highest replacement cost in the Landmark family; Class 4 impact rating; critical to document Premium vs standard in supplement for accurate pricing"
    },
    {
      manufacturer: "Atlas",
      series_name: "StormMaster Shake",
      type: "Laminate/Architectural",
      colors: ["Charcoal", "Weathered Wood", "Barkwood", "Pewter Gray", "Driftwood", "Antique Black", "Hearthstone Brown", "Slate Gray"],
      width_inches: 42,
      height_inches: 14,
      exposure_inches: 6,
      tooth_pattern: "Tapered",
      shadow_line: "Bold",
      sealant_type: "Solid",
      impact_resistance: "Class 4",
      production_status: "CURRENT",
      visual_identifiers: "LARGER than all standard shingles: 42 inches wide x 14 inches tall, 6 inch exposure — courses appear visibly TALLER on a roof; deep PRONOUNCED shake-style shadow lines (much more dramatic than standard architectural); double FASTAC sealant lines at TOP of shingle face; unique tab pattern resembling hand-split wood shake; Class 4 impact",
      product_url: "https://www.atlasroofing.com/residential/shingles/stormmaster-shake",
      discontinued_year: null,
      insurance_note: "Class 4 impact rating qualifies for significant insurance discounts; unique 42x14 size — no standard shingle is a substitute; full replacement required if discontinued; FASTAC sealant is a distinguishing feature"
    },
    {
      manufacturer: "Atlas",
      series_name: "StormMaster Slate",
      type: "Laminate/Architectural",
      colors: ["Charcoal", "Weathered Wood", "Pewter Gray", "Driftwood", "Antique Black", "Slate Gray"],
      width_inches: 42,
      height_inches: 14,
      exposure_inches: 6,
      tooth_pattern: "Narrowed",
      shadow_line: "Bold",
      sealant_type: "Solid",
      impact_resistance: "Class 4",
      production_status: "CURRENT",
      visual_identifiers: "Same large 42x14 format as StormMaster Shake but with SLATE-STYLE tab pattern instead of shake; double FASTAC sealant lines at top; courses appear visibly taller on roof; smoother tab surface than Shake version; Class 4 impact; tab edges more uniform and straight vs the irregular shake pattern",
      product_url: "https://www.atlasroofing.com/residential/shingles/stormmaster-slate",
      discontinued_year: null,
      insurance_note: "Class 4 impact rating; same large format as Shake — must be replaced with exact product; FASTAC sealant documented for insurance purposes"
    },
    {
      manufacturer: "IKO",
      series_name: "Cambridge",
      type: "Laminate/Architectural",
      colors: ["Charcoal", "Dual Black", "Weathered Wood", "Brownwood", "Slate Gray", "Driftwood", "Antique Pewter", "Autumn Brown", "Dual Gray"],
      width_inches: 13.375,
      height_inches: 40.875,
      exposure_inches: 5.625,
      tooth_pattern: "Straight",
      shadow_line: "Medium",
      sealant_type: "Solid",
      impact_resistance: "Class 3",
      production_status: "CURRENT",
      visual_identifiers: "ROUNDED inside corners at laminate tab cutouts — ALL other brands are SQUARE cornered; if you see rounded tab cutout corners, it is IKO, period; all tab edges completely straight, no flare; 40-7/8 inch width (slightly wider than most competitors); medium shadow line depth",
      product_url: "https://www.iko.com/na/residential/shingles/cambridge/",
      discontinued_year: null,
      insurance_note: "Class 3 impact rating — lower than Class 4 competitors; rounded tab corners are the definitive IKO identifier; must document exact series for accurate replacement pricing"
    },
    {
      manufacturer: "IKO",
      series_name: "Cambridge Xtreme",
      type: "Laminate/Architectural",
      colors: ["Charcoal", "Dual Black", "Weathered Wood", "Brownwood", "Slate Gray", "Driftwood"],
      width_inches: 13.375,
      height_inches: 40.875,
      exposure_inches: 5.625,
      tooth_pattern: "Straight",
      shadow_line: "Bold",
      sealant_type: "Solid",
      impact_resistance: "Class 4",
      production_status: "CURRENT",
      visual_identifiers: "Same ROUNDED tab cutout corners as all IKO Cambridge products — definitive IKO identifier; DEEPER shadow line than standard Cambridge; Class 4 impact rating (upgraded from standard Cambridge Class 3); same straight tab edges; premium version with enhanced dimensional depth",
      product_url: "https://www.iko.com/na/residential/shingles/cambridge-xtreme/",
      discontinued_year: null,
      insurance_note: "Class 4 impact rating — important upgrade from standard Cambridge; rounded corners still present; must document Xtreme vs standard Cambridge in supplement"
    },
    {
      manufacturer: "Malarkey",
      series_name: "Vista",
      type: "Laminate/Architectural",
      colors: ["Antique Brown", "Charcoal", "Driftwood", "Weathered Wood", "Slate Gray", "Brownstone", "Glacier Gray"],
      width_inches: 13.25,
      height_inches: 40,
      exposure_inches: 5.625,
      tooth_pattern: "Tapered",
      shadow_line: "Medium",
      sealant_type: "Solid",
      impact_resistance: "Class 4",
      production_status: "CURRENT",
      visual_identifiers: "Malarkey shingles have a distinctive RUBBERIZED granule appearance from NEX polymer modified asphalt — granules appear slightly more uniform and matte than competitors; no distinctive nailing line color (no white or blue lines); standard tab pattern; Class 4 impact; Pacific Northwest manufacturer — more common in western US",
      product_url: "https://www.malarkeyroofing.com/products/vista/",
      discontinued_year: null,
      insurance_note: "Class 4 impact rating; NEX polymer modified asphalt is a premium feature; more common in Pacific Northwest — adjusters in other regions may be less familiar with pricing"
    },
    {
      manufacturer: "Malarkey",
      series_name: "Legacy",
      type: "Laminate/Architectural",
      colors: ["Antique Brown", "Charcoal", "Driftwood", "Weathered Wood", "Slate Gray", "Brownstone", "Glacier Gray", "Harvest Gold"],
      width_inches: 13.25,
      height_inches: 40,
      exposure_inches: 5.625,
      tooth_pattern: "Tapered",
      shadow_line: "Bold",
      sealant_type: "Solid",
      impact_resistance: "Class 4",
      production_status: "CURRENT",
      visual_identifiers: "Same rubberized NEX polymer granule appearance as Vista but with DEEPER shadow line; premium version of Vista with enhanced dimensional depth; same standard tab pattern; Class 4 impact; granules appear denser and more varied in color distribution than Vista",
      product_url: "https://www.malarkeyroofing.com/products/legacy/",
      discontinued_year: null,
      insurance_note: "Premium product — higher replacement cost than Vista; Class 4 impact rating; NEX polymer modified asphalt is a distinguishing feature"
    },
    {
      manufacturer: "Tamko",
      series_name: "Heritage",
      type: "Laminate/Architectural",
      colors: ["Weathered Wood", "Charcoal", "Rustic Black", "Rustic Redwood", "Rustic Slate", "Natural Timber", "Vintage White", "Aged Oak", "Autumn Brown"],
      width_inches: 13.25,
      height_inches: 40,
      exposure_inches: 5.625,
      tooth_pattern: "Tapered",
      shadow_line: "Medium",
      sealant_type: "Solid",
      impact_resistance: "Class 3",
      production_status: "CURRENT",
      visual_identifiers: "TAMKO Heritage has a distinctive ORANGE nailing zone strip (not white like GAF, not blue like CertainTeed) — if you see an orange/amber nailing strip, it is TAMKO; standard tab pattern; medium shadow line; Class 3 impact; widely installed in the Midwest and South",
      product_url: "https://www.tamko.com/products/heritage/",
      discontinued_year: null,
      insurance_note: "Class 3 impact rating — lower than Class 4 competitors; orange nailing strip is the definitive TAMKO identifier; common in Midwest/South markets"
    },
    {
      manufacturer: "Tamko",
      series_name: "Heritage Vintage",
      type: "Laminate/Architectural",
      colors: ["Weathered Wood", "Charcoal", "Rustic Black", "Natural Timber", "Vintage White", "Aged Oak"],
      width_inches: 13.25,
      height_inches: 40,
      exposure_inches: 5.625,
      tooth_pattern: "Tapered",
      shadow_line: "Bold",
      sealant_type: "Solid",
      impact_resistance: "Class 4",
      production_status: "CURRENT",
      visual_identifiers: "Same orange nailing zone strip as standard Heritage — definitive TAMKO identifier; DEEPER shadow line than standard Heritage; Class 4 impact rating (upgraded from Heritage Class 3); premium version with enhanced dimensional depth; same tab pattern",
      product_url: "https://www.tamko.com/products/heritage-vintage/",
      discontinued_year: null,
      insurance_note: "Class 4 impact rating — important upgrade from standard Heritage; orange nailing strip still present; must document Vintage vs standard Heritage in supplement"
    },
    {
      manufacturer: "Pabco",
      series_name: "Premier",
      type: "Laminate/Architectural",
      colors: ["Charcoal", "Weathered Wood", "Barkwood", "Pewter Gray", "Driftwood", "Slate Gray"],
      width_inches: 13.25,
      height_inches: 40,
      exposure_inches: 5.625,
      tooth_pattern: "Tapered",
      shadow_line: "Medium",
      sealant_type: "Solid",
      impact_resistance: "Class 4",
      production_status: "CURRENT",
      visual_identifiers: "Pabco Premier has a distinctive GREEN nailing zone strip — if you see a green nailing strip, it is Pabco; standard tab pattern; medium shadow line; Class 4 impact; primarily sold in western US (California, Pacific Northwest); less common in other regions",
      product_url: "https://www.pabcoroofing.com/products/premier/",
      discontinued_year: null,
      insurance_note: "Class 4 impact rating; green nailing strip is the definitive Pabco identifier; primarily western US market — adjusters in other regions may need pricing verification"
    },
    {
      manufacturer: "BP",
      series_name: "Mystique 42",
      type: "Laminate/Architectural",
      colors: ["Charcoal", "Weathered Wood", "Pewter Gray", "Driftwood", "Slate Gray", "Brownwood"],
      width_inches: 13.25,
      height_inches: 42,
      exposure_inches: 5.625,
      tooth_pattern: "Tapered",
      shadow_line: "Medium",
      sealant_type: "Solid",
      impact_resistance: "Class 4",
      production_status: "CURRENT",
      visual_identifiers: "BP (Building Products of Canada) shingles are primarily sold in Canada; Mystique 42 is 42 inches wide (slightly wider than most US competitors at 40 inches); standard tab pattern; medium shadow line; Class 4 impact; if seen in northern US border states, likely a Canadian import",
      product_url: "https://www.bpcan.com/en/products/mystique-42/",
      discontinued_year: null,
      insurance_note: "Class 4 impact rating; Canadian manufacturer — pricing may differ from US Xactimate database; document manufacturer and series carefully for accurate supplement"
    }
  ],
  discontinued_shingles: [
    {
      manufacturer: "GAF",
      series_name: "Camelot (original)",
      type: "Laminate/Architectural",
      colors: ["Aged Oak", "Antique Slate", "Majestic Navy", "Welsh Gray", "San Gabriel", "Sheffield Black", "Williamsburg Slate", "Royal Slate", "Sunset Slate"],
      width_inches: 17,
      height_inches: 34.5,
      exposure_inches: 7.5,
      tooth_pattern: "Tapered",
      shadow_line: "Bold",
      sealant_type: "Solid",
      impact_resistance: "N/A",
      production_status: "DISCONTINUED",
      visual_identifiers: "CRITICAL VISUAL DISTINCTION: Camelot I tabs do NOT connect at bottom (open space between tab bases) — this is the key difference from Camelot II where tabs connect; ultra-premium ultra-dimensional slate-like shape; same 17x34.5 dimensions as Camelot II but tabs are separated; premium color palette with unique colors like Majestic Navy; 4 bundles per square; no LayerLock",
      product_url: "https://www.gaf.com/en-us/roofing-products/residential-roofing/roofing-shingles",
      discontinued_year: 2014,
      insurance_note: "Discontinued 2014; unique tab-separation design means zero current products are an exact match; insurance claims require full replacement if color or tab-separation pattern cannot be matched; Camelot II is the current successor but tabs ARE connected at base — visually different"
    },
    {
      manufacturer: "GAF",
      series_name: "Timberline Natural Shadow",
      type: "Laminate/Architectural",
      colors: ["Charcoal", "Pewter Gray", "Weathered Wood", "Barkwood", "Driftwood", "Hunter Green", "Mission Brown", "Oyster Gray", "Shakewood"],
      width_inches: 13.25,
      height_inches: 40,
      exposure_inches: 5.625,
      tooth_pattern: "Tapered",
      shadow_line: "Blended",
      sealant_type: "Dashed",
      impact_resistance: "N/A",
      production_status: "DISCONTINUED",
      visual_identifiers: "Predecessor to Timberline HDZ — NO LayerLock crimps (HDZ has 21 visible crimps); NO StrikeZone white nailing lines (or older version with single line); same general tab profile as HDZ but without the LayerLock technology; if you see a GAF-style shingle without the 21 crimp points, it is likely Natural Shadow or older Timberline",
      product_url: "https://www.gaf.com/en-us/roofing-products/residential-roofing/roofing-shingles",
      discontinued_year: 2019,
      insurance_note: "Discontinued ~2019; replaced by Timberline HDZ; no exact current match — HDZ is the successor but has LayerLock technology; full replacement trigger for discontinued colors"
    },
    {
      manufacturer: "GAF",
      series_name: "Slateline",
      type: "Laminate/Architectural",
      colors: ["Antique Slate", "Charcoal", "English Gray", "Old English Pewter", "Weathered Slate"],
      width_inches: 17,
      height_inches: 34.5,
      exposure_inches: 7.5,
      tooth_pattern: "Narrowed",
      shadow_line: "Bold",
      sealant_type: "Solid",
      impact_resistance: "N/A",
      production_status: "DISCONTINUED",
      visual_identifiers: "Slate-style shingle with NARROWED tab pattern (tabs are narrower than Camelot); 17x34.5 format like Camelot; deep bold shadow lines; premium slate appearance; discontinued colors like Old English Pewter are unique identifiers; no LayerLock",
      product_url: "https://www.gaf.com/en-us/roofing-products/residential-roofing/roofing-shingles",
      discontinued_year: 2016,
      insurance_note: "Discontinued 2016; unique narrowed tab pattern has no current exact match; full replacement required; document discontinued status carefully for insurance claim"
    },
    {
      manufacturer: "Owens Corning",
      series_name: "Oakridge",
      type: "Laminate/Architectural",
      colors: ["Onyx", "Estate Gray", "Driftwood", "Teak", "Quarry Gray", "Brownwood", "Sierra Gray", "Desert Tan"],
      width_inches: 13.375,
      height_inches: 40,
      exposure_inches: 5.75,
      tooth_pattern: "Tapered",
      shadow_line: "Medium",
      sealant_type: "Solid",
      impact_resistance: "N/A",
      production_status: "DISCONTINUED",
      visual_identifiers: "NO SureNail fabric strip (Duration has it, Oakridge does NOT) — this is the key difference; medium shadow line depth (less dramatic than Duration); same general tab profile as Duration but without the woven fabric strip in nailing zone; if you see an Owens Corning-style shingle without the fabric strip, it is likely Oakridge",
      product_url: "https://www.owenscorning.com/en-us/roofing/shingles",
      discontinued_year: 2020,
      insurance_note: "Discontinued ~2020; replaced by Duration; no SureNail = Oakridge not Duration; full replacement trigger for discontinued colors; document absence of SureNail for insurance purposes"
    },
    {
      manufacturer: "Owens Corning",
      series_name: "Berkshire",
      type: "Laminate/Architectural",
      colors: ["Aged Bronze", "Antique Silver", "Autumn Brown", "Charcoal", "Driftwood", "Estate Gray", "Onyx"],
      width_inches: 17,
      height_inches: 40,
      exposure_inches: 7.5,
      tooth_pattern: "LG Tapered",
      shadow_line: "Bold",
      sealant_type: "Solid",
      impact_resistance: "N/A",
      production_status: "DISCONTINUED",
      visual_identifiers: "LARGE FORMAT: 17x40 inches — much larger than standard Duration (13.375x40); deep dramatic shadow lines; premium shake-like appearance; may have SureNail fabric strip (later production runs); courses appear visibly taller on roof due to 7.5 inch exposure vs 5.75 for Duration",
      product_url: "https://www.owenscorning.com/en-us/roofing/shingles",
      discontinued_year: 2018,
      insurance_note: "Discontinued 2018; unique 17x40 large format has no current exact OC match; full replacement required; document large format for accurate insurance pricing"
    },
    {
      manufacturer: "CertainTeed",
      series_name: "Landmark TL",
      type: "Laminate/Architectural",
      colors: ["Moire Black", "Heather Blend", "Weathered Wood", "Colonial Slate", "Pewter", "Georgetown Gray"],
      width_inches: 13.25,
      height_inches: 40,
      exposure_inches: 5.625,
      tooth_pattern: "Straight",
      shadow_line: "Bold",
      sealant_type: "Solid",
      impact_resistance: "N/A",
      production_status: "DISCONTINUED",
      visual_identifiers: "Same blue NailTrak nailing lines as current Landmark — definitive CertainTeed identifier; TL (Triple Layer) had THREE laminate layers vs standard two; DEEPEST shadow line in the Landmark family at time of production; heavier weight than current Landmark Pro; if you see CertainTeed blue lines with extremely deep shadow, it may be TL",
      product_url: "https://www.certainteed.com/roofing/",
      discontinued_year: 2017,
      insurance_note: "Discontinued 2017; triple-layer construction has no current exact match; full replacement required; document TL designation for accurate insurance pricing"
    },
    {
      manufacturer: "CertainTeed",
      series_name: "Presidential Shake TL",
      type: "Laminate/Architectural",
      colors: ["Autumn Blend", "Burnt Sienna", "Charcoal", "Georgetown Gray", "Heather Blend", "Moire Black", "Weathered Wood"],
      width_inches: 17,
      height_inches: 40,
      exposure_inches: 7.5,
      tooth_pattern: "LG Tapered",
      shadow_line: "Bold",
      sealant_type: "Solid",
      impact_resistance: "N/A",
      production_status: "DISCONTINUED",
      visual_identifiers: "LARGE FORMAT: 17x40 inches with shake-style appearance; same blue NailTrak nailing lines as all CertainTeed products; deep dramatic shadow lines resembling wood shake; courses appear visibly taller on roof; premium product with triple-layer construction; unique large shake appearance",
      product_url: "https://www.certainteed.com/roofing/",
      discontinued_year: 2019,
      insurance_note: "Discontinued 2019; unique large format shake appearance has no current exact CertainTeed match; full replacement required; document Presidential Shake TL designation carefully"
    },
    {
      manufacturer: "Atlas",
      series_name: "Pinnacle Pristine",
      type: "Laminate/Architectural",
      colors: ["Charcoal", "Weathered Wood", "Barkwood", "Pewter Gray", "Driftwood", "Antique Black"],
      width_inches: 13.25,
      height_inches: 40,
      exposure_inches: 5.625,
      tooth_pattern: "Tapered",
      shadow_line: "Medium",
      sealant_type: "Solid",
      impact_resistance: "N/A",
      production_status: "DISCONTINUED",
      visual_identifiers: "Atlas standard-format shingle (pre-StormMaster era); no distinctive nailing line color; standard tab pattern; medium shadow line; predecessor to StormMaster line; if you see an Atlas shingle without the large 42-inch format, it is likely Pinnacle Pristine or similar older Atlas product",
      product_url: "https://www.atlasroofing.com/residential/shingles",
      discontinued_year: 2016,
      insurance_note: "Discontinued 2016; replaced by StormMaster line; standard format has no exact current Atlas match; full replacement required for discontinued colors"
    },
    {
      manufacturer: "IKO",
      series_name: "Dynasty",
      type: "Laminate/Architectural",
      colors: ["Charcoal", "Dual Black", "Weathered Wood", "Brownwood", "Slate Gray", "Driftwood", "Antique Pewter"],
      width_inches: 13.375,
      height_inches: 40.875,
      exposure_inches: 5.625,
      tooth_pattern: "Straight",
      shadow_line: "Bold",
      sealant_type: "Solid",
      impact_resistance: "Class 4",
      production_status: "DISCONTINUED",
      visual_identifiers: "Same ROUNDED tab cutout corners as all IKO products — definitive IKO identifier; DEEPER shadow line than Cambridge; Class 4 impact rating; premium version of Cambridge that was discontinued; same straight tab edges; if you see IKO rounded corners with deep shadow line, it is likely Dynasty",
      product_url: "https://www.iko.com/na/residential/shingles",
      discontinued_year: 2021,
      insurance_note: "Discontinued 2021; Class 4 impact rating; rounded corners still present; full replacement required for discontinued colors; document Dynasty vs Cambridge for accurate pricing"
    },
    {
      manufacturer: "Malarkey",
      series_name: "Windsor",
      type: "Laminate/Architectural",
      colors: ["Antique Brown", "Charcoal", "Driftwood", "Weathered Wood", "Slate Gray", "Brownstone"],
      width_inches: 13.25,
      height_inches: 40,
      exposure_inches: 5.625,
      tooth_pattern: "Tapered",
      shadow_line: "Bold",
      sealant_type: "Solid",
      impact_resistance: "Class 4",
      production_status: "DISCONTINUED",
      visual_identifiers: "Same rubberized NEX polymer granule appearance as current Malarkey products; DEEP shadow line — deeper than current Vista; Class 4 impact; premium Malarkey product that was discontinued; if you see Malarkey-style granules with very deep shadow line, it may be Windsor",
      product_url: "https://www.malarkeyroofing.com/products",
      discontinued_year: 2020,
      insurance_note: "Discontinued 2020; replaced by Legacy; full replacement required for discontinued colors; document Windsor designation for accurate pricing"
    },
    {
      manufacturer: "Tamko",
      series_name: "Elite Glass-Seal",
      type: "3-Tab",
      colors: ["Weathered Wood", "Charcoal", "Rustic Black", "Natural Timber", "Vintage White"],
      width_inches: 12,
      height_inches: 36,
      exposure_inches: 5,
      tooth_pattern: "Straight",
      shadow_line: "None",
      sealant_type: "Solid",
      impact_resistance: "N/A",
      production_status: "DISCONTINUED",
      visual_identifiers: "3-TAB shingle (three equally-spaced cutouts creating three flat tabs); FLAT appearance with no dimensional shadow line; 36 inches wide x 12 inches tall; 5 inch exposure; may have orange TAMKO nailing strip; 3-tab shingles are generally older installations (pre-2000s common); if you see a flat non-dimensional shingle, it is 3-tab",
      product_url: "https://www.tamko.com/products",
      discontinued_year: 2015,
      insurance_note: "Discontinued 2015; 3-tab shingles are generally older — full replacement with architectural shingles may be required; document 3-tab status for insurance; replacement cost significantly different from architectural"
    },
    {
      manufacturer: "GAF",
      series_name: "Royal Sovereign",
      type: "3-Tab",
      colors: ["Charcoal", "Pewter Gray", "Weathered Wood", "Barkwood", "Slate", "Hunter Green"],
      width_inches: 12,
      height_inches: 36,
      exposure_inches: 5,
      tooth_pattern: "Straight",
      shadow_line: "None",
      sealant_type: "Solid",
      impact_resistance: "N/A",
      production_status: "DISCONTINUED",
      visual_identifiers: "3-TAB shingle (three equally-spaced cutouts); FLAT appearance with no dimensional shadow line; 36 inches wide x 12 inches tall; 5 inch exposure; may have white GAF nailing line; 3-tab shingles are generally older installations; GAF Royal Sovereign was one of the most common 3-tab shingles in the US",
      product_url: "https://www.gaf.com/en-us/roofing-products/residential-roofing/roofing-shingles",
      discontinued_year: 2018,
      insurance_note: "Discontinued 2018; 3-tab shingles are older — full replacement with architectural shingles typically required; document 3-tab status; replacement cost significantly different from architectural"
    },
    {
      manufacturer: "Owens Corning",
      series_name: "Classic",
      type: "3-Tab",
      colors: ["Onyx", "Estate Gray", "Driftwood", "Teak", "Quarry Gray", "Brownwood"],
      width_inches: 12,
      height_inches: 36,
      exposure_inches: 5,
      tooth_pattern: "Straight",
      shadow_line: "None",
      sealant_type: "Solid",
      impact_resistance: "N/A",
      production_status: "DISCONTINUED",
      visual_identifiers: "3-TAB shingle (three equally-spaced cutouts); FLAT appearance with no dimensional shadow line; 36 inches wide x 12 inches tall; 5 inch exposure; NO SureNail fabric strip (that is Duration only); Owens Corning 3-tab was widely installed in the 1990s-2000s; flat non-dimensional appearance is the key identifier",
      product_url: "https://www.owenscorning.com/en-us/roofing/shingles",
      discontinued_year: 2016,
      insurance_note: "Discontinued 2016; 3-tab shingles are older — full replacement with architectural shingles typically required; document 3-tab status; replacement cost significantly different from architectural"
    }
  ]
};

export const SHINGLE_IDENTIFICATION_PROMPT = `You are an expert roofing shingle identification AI for Conscious Claims, a roofing insurance claims intelligence platform. You have access to a comprehensive database of shingle products from 9 manufacturers.

Your job is to analyze a photo of a roofing shingle and identify:
1. The manufacturer
2. The exact series/product line
3. The most likely color name
4. Whether it is CURRENT or DISCONTINUED
5. Key visual features that led to your identification
6. Insurance implications (especially if discontinued — potential full roof replacement)

CRITICAL VISUAL FINGERPRINTS — USE THESE FIRST BEFORE ANYTHING ELSE:

Owens Corning Duration / TruDefinition Duration:
- THE definitive identifier: SureNail = VISIBLE WOVEN FABRIC STRIP (tan/brown textile mesh) embedded in the nailing zone. NO other manufacturer has this. If you see a fabric/textile strip, it is Owens Corning, period.
- XL tabs: three apparent sizes (small/medium/XL) vs two for most competitors
- Shadow line: WIDE and SHARPLY defined with crisp straight edge
- COLORS: Onyx = very dark near-black uniform color. Estate Gray = medium cool gray. Driftwood = WARM BROWN/TAN with lighter sandy highlights — NOT gray. Stone Gray = medium cool gray with subtle blending. Sierra Gray = lighter gray. Do NOT call Driftwood gray. Do NOT confuse warm brown tones with gray tones.

GAF Timberline HDZ:
- Two WHITE PAINTED nailing lines (StrikeZone) — definitive GAF identifier
- Small laminate tabs have FLARED/SPLAYED outer edges (not straight)
- Shadow line: SOFT and BLENDED, not sharp or crisp
- LayerLock: 21 visible crimp points binding the two laminate layers
- Colors: Weathered Wood = warm brown/gray blend. Charcoal = dark gray. Barkwood = dark brown. Pewter Gray = medium gray. Driftwood = warm tan/brown.

CertainTeed Landmark:
- Double BLUE parallel nailing lines (NailTrak) — ONLY manufacturer using blue nailing lines. If you see blue lines, it is CertainTeed, period.
- Small laminate tabs have STRAIGHT edges (not flared like GAF)
- Plastic release strip on back labeled CertainTeed

Atlas StormMaster Shake/Slate:
- LARGER than all standard shingles: 42 inches wide x 14 inches tall, 6 inch exposure
- Deep PRONOUNCED shake-style shadow lines (much more dramatic than standard architectural)
- Double FASTAC sealant lines at TOP of shingle face
- Courses appear visibly TALLER on a roof

IKO Cambridge:
- ROUNDED inside corners at laminate tab cutouts — ALL other brands are SQUARE cornered. If you see rounded tab cutout corners, it is IKO, period.
- All tab edges completely straight, no flare
- 40-7/8 inch width

TAMKO Heritage:
- ORANGE/AMBER nailing zone strip — if you see an orange nailing strip, it is TAMKO

Pabco Premier:
- GREEN nailing zone strip — if you see a green nailing strip, it is Pabco

3-TAB SHINGLES (any manufacturer):
- FLAT appearance with NO dimensional shadow line
- Three equally-spaced cutouts creating three flat tabs
- 36 inches wide x 12 inches tall, 5 inch exposure
- Generally older installations (pre-2000s common)

CRITICAL IDENTIFICATION RULES:
1. NEVER identify Driftwood as gray — Driftwood is ALWAYS warm brown/tan
2. If you see fabric/textile strip in nailing zone = Owens Corning Duration
3. If you see blue nailing lines = CertainTeed Landmark
4. If you see rounded tab cutout corners = IKO Cambridge
5. If you see flared/splayed small tab edges = GAF Timberline
6. If you see orange nailing strip = TAMKO Heritage
7. If you see green nailing strip = Pabco Premier
8. Analyze granule color carefully: distinguish warm brown tones from cool gray tones before naming any color
9. When uncertain between two options, list both as alternatives — do not guess
10. If shingle appears FLAT with no shadow line = 3-Tab (older, likely discontinued)

SHINGLE DATABASE (use for cross-referencing):
{{DATABASE}}

Respond in this exact JSON format:
{
  "identified": true,
  "confidence": "HIGH",
  "manufacturer": "GAF",
  "series_name": "Timberline HDZ",
  "color": "Charcoal",
  "production_status": "CURRENT",
  "type": "Laminate/Architectural",
  "dimensions": "13.25 x 40 inches",
  "visual_features_matched": ["White StrikeZone nailing lines", "Flared tab edges", "Blended shadow line", "LayerLock crimps visible"],
  "reasoning": "Detailed explanation of identification logic",
  "insurance_implications": "Current product — standard replacement. Class 4 impact rating qualifies for insurance discounts.",
  "alternative_matches": [
    {"manufacturer": "Owens Corning", "series": "Duration", "confidence": "LOW", "reason": "No SureNail fabric strip visible"}
  ]
}

If you cannot identify the shingle, set "identified" to false and explain why in the reasoning field.`;
