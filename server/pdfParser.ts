import { PDFParse } from "pdf-parse";

export interface ParsedLineItem {
  code: string;
  description: string;
  quantity: string;
  unit: string;
  unitPrice: string;
  totalPrice: string;
}

export interface ParsedEstimate {
  claimNumber?: string;
  propertyAddress?: string;
  insuredName?: string;
  adjusterName?: string;
  totalAmount?: string;
  lineItems: ParsedLineItem[];
  rawText: string;
}

// Extract all text from a PDFParse result (getText returns { pages: [{text, num}] })
async function extractText(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: new Uint8Array(buffer), verbosity: 0 }) as any;
  await parser.load();
  const result = await parser.getText();

  // getText returns either a string or { pages: [{text, num}] }
  if (typeof result === "string") return result;
  if (result && Array.isArray(result.pages)) {
    return result.pages.map((p: any) => (typeof p === "string" ? p : p?.text ?? "")).join("\n");
  }
  // Fallback: stringify
  return JSON.stringify(result);
}

// Parse an Xactimate PDF buffer and extract line items
export async function parseXactimatePDF(buffer: Buffer): Promise<ParsedEstimate> {
  const text = await extractText(buffer);

  const result: ParsedEstimate = {
    lineItems: [],
    rawText: text,
  };

  // Extract claim number
  const claimMatch = text.match(/claim\s*(?:number|#|no\.?)[\s:]*([A-Z0-9\-]+)/i);
  if (claimMatch) result.claimNumber = claimMatch[1].trim();

  // Extract insured name
  const insuredMatch = text.match(/insured[\s:]+([^\n]+)/i);
  if (insuredMatch) result.insuredName = insuredMatch[1].trim().substring(0, 100);

  // Extract property address
  const addressMatch = text.match(/(?:property|loss\s*location|address)[\s:]+([^\n]+)/i);
  if (addressMatch) result.propertyAddress = addressMatch[1].trim().substring(0, 200);

  // Extract adjuster name
  const adjusterMatch = text.match(/adjuster[\s:]+([^\n]+)/i);
  if (adjusterMatch) result.adjusterName = adjusterMatch[1].trim().substring(0, 100);

  // Extract total
  const totalMatch = text.match(/(?:line\s*item\s*total|total\s*rcv|total)[\s:$]*([0-9,]+\.[0-9]{2})/i);
  if (totalMatch) result.totalAmount = totalMatch[1].replace(/,/g, "");

  // Extract line items - Xactimate format: CODE  Description  Qty  Unit  Unit Price  Total
  const lines = text.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.length < 5) continue;

    // Pattern: starts with RFG, GUT, ELE, PTG, etc. (Xactimate category codes)
    const xactimatePattern =
      /^([A-Z]{2,6}\s+[A-Z0-9_&]+)\s+(.+?)\s+([\d.]+)\s+(LF|SF|SQ|EA|HR|LS|PCT|SY|CF|CY|LB|GAL|TON)\s+\$?([\d,.]+)\s+\$?([\d,.]+)/i;
    const match = trimmed.match(xactimatePattern);

    if (match) {
      result.lineItems.push({
        code: match[1].trim().toUpperCase(),
        description: match[2].trim(),
        quantity: match[3],
        unit: match[4].toUpperCase(),
        unitPrice: match[5].replace(/,/g, ""),
        totalPrice: match[6].replace(/,/g, ""),
      });
      continue;
    }

    // Simpler pattern: look for known Xactimate code prefixes
    const knownPrefixes = [
      "RFG", "GUT", "ELE", "PTG", "PLM", "HVC", "INS", "WTR", "FLR", "CLN",
      "PERMIT", "DUMPSTER", "DEBRIS", "STR", "MAS", "CNT", "DRS", "WIN",
    ];

    for (const prefix of knownPrefixes) {
      if (trimmed.toUpperCase().startsWith(prefix)) {
        const parts = trimmed.split(/\s{2,}/);
        if (parts.length >= 2) {
          result.lineItems.push({
            code: parts[0]?.trim().toUpperCase() || prefix,
            description: parts[1]?.trim() || trimmed,
            quantity: parts[2]?.trim() || "",
            unit: parts[3]?.trim() || "",
            unitPrice: parts[4]?.trim() || "",
            totalPrice: parts[5]?.trim() || "",
          });
        }
        break;
      }
    }
  }

  // Deduplicate by code+description
  const seen = new Set<string>();
  result.lineItems = result.lineItems.filter((item) => {
    const key = `${item.code}|${item.description}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return result;
}
