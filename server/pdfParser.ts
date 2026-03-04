import { PDFParse } from "pdf-parse";
import { invokeLLM } from "./_core/llm";

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
  parsedByLLM?: boolean;
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
  return JSON.stringify(result);
}

// Map common Xactimate description keywords to standard codes
function descriptionToCode(description: string): string {
  const desc = description.toLowerCase();
  if (desc.includes("starter") || desc.includes("asphalt starter")) return "RFG STRT";
  if (desc.includes("drip edge")) return "RFG DRIP";
  if (desc.includes("valley") && desc.includes("metal")) return "RFG VMTL";
  if (desc.includes("step flashing")) return "RFG STPFLSH";
  if (desc.includes("pipe jack") || desc.includes("pipe boot") || desc.includes("split boot")) return "RFG FLPIPE";
  if (desc.includes("ice") && desc.includes("water")) return "RFG ICEWATER";
  if (desc.includes("ridge vent") || desc.includes("continuous ridge")) return "RFG RDGVNT";
  if (desc.includes("ridge cap") || desc.includes("hip") && desc.includes("ridge")) return "RFG RIDGCAP";
  if (desc.includes("roofing felt") || desc.includes("felt")) return "RFG FELT";
  if (desc.includes("laminated") || desc.includes("shingle") || desc.includes("comp. shingle")) return "RFG LAMI";
  if (desc.includes("remove") && desc.includes("shingle")) return "RFG LAMI R&R";
  if (desc.includes("chimney flashing")) return "RFG CHFLSH";
  if (desc.includes("counterflashing") || desc.includes("apron flashing")) return "RFG CNTRFLSH";
  if (desc.includes("skylight") && desc.includes("flashing")) return "RFG SKLTFLSH";
  if (desc.includes("gutter") || desc.includes("downspout")) return "GUT D&R";
  if (desc.includes("dumpster")) return "DUMPSTER";
  if (desc.includes("debris")) return "DEBRIS";
  if (desc.includes("permit")) return "PERMIT";
  if (desc.includes("steep roof")) return "RFG STEEP";
  if (desc.includes("high roof")) return "RFG HIGH";
  if (desc.includes("satellite") || desc.includes("digital satellite")) return "ELE SATDSH";
  if (desc.includes("power attic vent") || desc.includes("attic vent")) return "RFG ATVNT";
  if (desc.includes("roof vent") || desc.includes("turtle")) return "RFG RFVNT";
  if (desc.includes("decking") || desc.includes("sheathing") || desc.includes("plywood")) return "RFG DECK";
  if (desc.includes("underlayment")) return "RFG UNDLY";
  if (desc.includes("flashing")) return "RFG FLSH";
  // Fallback: use first 3 words uppercased
  return description.split(/\s+/).slice(0, 2).join(" ").toUpperCase().substring(0, 20);
}

// Parse real Xactimate estimate format:
// "   5. Asphalt starter - universal starter course   471.11 LF   2.09   21.18   1,005.80   (220.81)   784.99"
function parseLineItemsFromText(text: string): ParsedLineItem[] {
  const items: ParsedLineItem[] = [];
  const lines = text.split("\n");

  // Pattern for numbered line items with trailing numbers:
  // "   5. Description text here   QTY UNIT   PRICE   TAX   RCV   (DEPREC.)   ACV"
  const lineItemPattern =
    /^\s*\d+\.\s+(.+?)\s{2,}([\d,]+\.?\d*)\s+(EA|SQ|LF|SF|HR|LS|PCT|SY|CF|CY|LB|GAL|TON|BF|MBF)\s+([\d,]+\.?\d*)\s+([\d,]+\.?\d*)\s+([\d,]+\.?\d*)/i;

  // Also handle continuation lines (description wraps to next line)
  let pendingDescription = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines, headers, totals, page markers
    if (!trimmed) { pendingDescription = ""; continue; }
    if (/^(DESCRIPTION|QTY|UNIT|PRICE|TAX|RCV|DEPREC|ACV|TOTAL|Page:|KYLE_|Georgia Farm|PO Box|Macon|Fax|Dear|The enclosed|If your|You are|Payment|No action|Grand Total|Area|Totals:|Line Item Totals)/i.test(trimmed)) {
      pendingDescription = "";
      continue;
    }

    const match = line.match(lineItemPattern);
    if (match) {
      const rawDesc = (pendingDescription ? pendingDescription + " " : "") + match[1].trim();
      const description = rawDesc.replace(/^\d+\.\s*/, "").trim();
      const code = descriptionToCode(description);
      items.push({
        code,
        description: description.substring(0, 120),
        quantity: match[2].replace(/,/g, ""),
        unit: match[3].toUpperCase(),
        unitPrice: match[4].replace(/,/g, ""),
        totalPrice: match[6].replace(/,/g, ""), // RCV column
      });
      pendingDescription = "";
      continue;
    }

    // Check if this is a continuation of a previous numbered item description
    // (line starts with spaces and has no numbers at the end)
    if (/^\s{5,}/.test(line) && !/\d+\.\d+\s+(EA|SQ|LF|SF)/i.test(line) && /[a-zA-Z]/.test(trimmed)) {
      // Could be a continuation line — store it
      if (pendingDescription) {
        pendingDescription += " " + trimmed;
      }
    } else {
      pendingDescription = "";
    }
  }

  // Deduplicate by description
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.description.toLowerCase().substring(0, 40);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// LLM fallback: send raw text to AI and ask it to extract line items as JSON
async function parseWithLLM(rawText: string): Promise<{
  lineItems: ParsedLineItem[];
  claimNumber?: string;
  insuredName?: string;
  propertyAddress?: string;
  adjusterName?: string;
  totalAmount?: string;
}> {
  // Trim text to avoid token limits — focus on the estimate body
  const trimmed = rawText.substring(0, 12000);

  const response = await invokeLLM({
    messages: [
      {
        role: "system" as const,
        content: "You are an expert Xactimate insurance estimate parser. Extract all line items and metadata from the provided estimate text. Return ONLY valid JSON matching the schema exactly.",
      },
      {
        role: "user" as const,
        content: `Parse this Xactimate insurance estimate and extract all line items and key metadata.\n\nESTIMATE TEXT:\n${trimmed}`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "xactimate_estimate",
        strict: true,
        schema: {
          type: "object",
          properties: {
            claimNumber: { type: "string", description: "Claim number from the estimate" },
            insuredName: { type: "string", description: "Name of the insured homeowner" },
            propertyAddress: { type: "string", description: "Property address" },
            adjusterName: { type: "string", description: "Name of the adjuster or estimator" },
            totalAmount: { type: "string", description: "Total RCV amount as a number string e.g. 44432.53" },
            lineItems: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  code: { type: "string", description: "Xactimate code like RFG STRT, RFG DRIP, GUT D&R, PERMIT" },
                  description: { type: "string", description: "Full description of the line item" },
                  quantity: { type: "string", description: "Quantity as a number string" },
                  unit: { type: "string", description: "Unit of measure: SQ, LF, SF, EA, etc." },
                  unitPrice: { type: "string", description: "Unit price as a number string" },
                  totalPrice: { type: "string", description: "Total RCV price as a number string" },
                },
                required: ["code", "description", "quantity", "unit", "unitPrice", "totalPrice"],
                additionalProperties: false,
              },
            },
          },
          required: ["claimNumber", "insuredName", "propertyAddress", "adjusterName", "totalAmount", "lineItems"],
          additionalProperties: false,
        },
      },
    },
  });

  const rawContent = response?.choices?.[0]?.message?.content;
  if (!rawContent) throw new Error("LLM returned empty response");
  const content = typeof rawContent === "string" ? rawContent : JSON.stringify(rawContent);
  return JSON.parse(content);
}

// Parse an Xactimate PDF buffer and extract line items
export async function parseXactimatePDF(buffer: Buffer): Promise<ParsedEstimate> {
  const text = await extractText(buffer);

  const result: ParsedEstimate = {
    lineItems: [],
    rawText: text,
  };

  // Extract metadata with regex
  const claimMatch = text.match(/claim\s*(?:number|#|no\.?)[\s:]*([A-Z0-9\-]+)/i);
  if (claimMatch) result.claimNumber = claimMatch[1].trim();

  const insuredMatch = text.match(/insured[\s:]+([^\n]+)/i);
  if (insuredMatch) result.insuredName = insuredMatch[1].trim().substring(0, 100);

  const addressMatch = text.match(/(?:property|loss\s*location|address)[\s:]+([^\n]+)/i);
  if (addressMatch) result.propertyAddress = addressMatch[1].trim().substring(0, 200);

  const adjusterMatch = text.match(/(?:estimator|adjuster|claim rep)[\s.:]+([^\n]+)/i);
  if (adjusterMatch) result.adjusterName = adjusterMatch[1].trim().substring(0, 100);

  const totalMatch = text.match(/(?:line\s*item\s*total[s]?|total\s*rcv|grand\s*total)[\s:$]*([0-9,]+\.[0-9]{2})/i);
  if (totalMatch) result.totalAmount = totalMatch[1].replace(/,/g, "");

  // First pass: regex-based parsing for numbered line item format
  result.lineItems = parseLineItemsFromText(text);

  // Second pass: if regex found fewer than 3 items, use LLM fallback
  if (result.lineItems.length < 3) {
    try {
      const llmResult = await parseWithLLM(text);
      result.lineItems = llmResult.lineItems || [];
      result.parsedByLLM = true;
      // Fill in any missing metadata from LLM
      if (!result.claimNumber && llmResult.claimNumber) result.claimNumber = llmResult.claimNumber;
      if (!result.insuredName && llmResult.insuredName) result.insuredName = llmResult.insuredName;
      if (!result.propertyAddress && llmResult.propertyAddress) result.propertyAddress = llmResult.propertyAddress;
      if (!result.adjusterName && llmResult.adjusterName) result.adjusterName = llmResult.adjusterName;
      if (!result.totalAmount && llmResult.totalAmount) result.totalAmount = llmResult.totalAmount;
    } catch (err) {
      console.error("[pdfParser] LLM fallback failed:", err);
      // Keep whatever regex found
    }
  }

  return result;
}
