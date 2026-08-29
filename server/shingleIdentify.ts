import fs from "node:fs/promises";
import path from "node:path";
import { invokeLLM } from "./_core/llm";
import { getUploadDir } from "./storage";
import {
  SHINGLE_DATABASE,
  SHINGLE_IDENTIFICATION_PROMPT,
} from "./shingleDatabase";

export type ShingleIdentifyResult = {
  identified: boolean;
  confidence?: "HIGH" | "MEDIUM" | "LOW";
  manufacturer?: string;
  series_name?: string;
  color?: string;
  production_status?: "CURRENT" | "DISCONTINUED";
  type?: string;
  dimensions?: string;
  visual_features_matched?: string[];
  reasoning?: string;
  insurance_implications?: string;
  alternative_matches?: Array<{
    manufacturer: string;
    series: string;
    confidence: string;
    reason?: string;
  }>;
};

const SAFE_DISCONTINUED_LINE =
  "Discontinued plus storm damage is a strong full-roof fight. Carriers still want proof.";

export function sanitizeInsuranceCopy(text: string): string {
  if (
    /automatically (approve|approved|pays?|pay)|guarantee[sd]? (full )?replacement|triggers? full replacement claims/i.test(
      text
    )
  ) {
    return SAFE_DISCONTINUED_LINE;
  }
  return text;
}

export function parseIdentifyResult(content: string): ShingleIdentifyResult {
  const match = content.match(/\{[\s\S]*\}/);
  if (!match) {
    return { identified: false, reasoning: content || "No identification returned." };
  }
  try {
    const parsed = JSON.parse(match[0]) as ShingleIdentifyResult;
    if (typeof parsed.identified !== "boolean") {
      return { identified: false, reasoning: content };
    }
    if (parsed.insurance_implications) {
      parsed.insurance_implications = sanitizeInsuranceCopy(
        parsed.insurance_implications
      );
    } else if (parsed.identified && parsed.production_status === "DISCONTINUED") {
      parsed.insurance_implications = SAFE_DISCONTINUED_LINE;
    }
    return parsed;
  } catch {
    return { identified: false, reasoning: content };
  }
}

function isLocalUploadPath(photoUrl: string): boolean {
  if (photoUrl.startsWith("/uploads/")) return true;
  try {
    const parsed = new URL(photoUrl);
    return parsed.pathname.startsWith("/uploads/");
  } catch {
    return false;
  }
}

function uploadKeyFromUrl(photoUrl: string): string {
  if (photoUrl.startsWith("/uploads/")) {
    return photoUrl.slice("/uploads/".length);
  }
  const parsed = new URL(photoUrl);
  return parsed.pathname.replace(/^\/uploads\//, "");
}

function safeUploadPath(key: string): string {
  const uploadDir = getUploadDir();
  const abs = path.resolve(uploadDir, key);
  const rel = path.relative(uploadDir, abs);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new Error("Invalid upload path");
  }
  return abs;
}

function mimeFromName(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".heic") return "image/heic";
  return "image/jpeg";
}

export async function resolvePhotoForLlm(photoUrl: string): Promise<string> {
  if (photoUrl.startsWith("data:")) return photoUrl;
  if (!isLocalUploadPath(photoUrl)) return photoUrl;

  const filePath = safeUploadPath(uploadKeyFromUrl(photoUrl));
  const bytes = await fs.readFile(filePath);
  const mime = mimeFromName(filePath);
  return `data:${mime};base64,${bytes.toString("base64")}`;
}

function databaseSummary() {
  const allShingles = [
    ...SHINGLE_DATABASE.current_shingles,
    ...SHINGLE_DATABASE.discontinued_shingles,
  ];
  return allShingles.map((s) => ({
    manufacturer: s.manufacturer,
    series_name: s.series_name,
    type: s.type,
    colors: s.colors,
    production_status: s.production_status,
    visual_identifiers: s.visual_identifiers,
    insurance_note: s.insurance_note,
    discontinued_year: s.discontinued_year,
  }));
}

export async function identifyShingle(photoUrl: string): Promise<ShingleIdentifyResult> {
  const imageUrl = await resolvePhotoForLlm(photoUrl);
  const prompt = SHINGLE_IDENTIFICATION_PROMPT.replace(
    "{{DATABASE}}",
    JSON.stringify(databaseSummary(), null, 0)
  );
  const response = await invokeLLM({
    messages: [
      { role: "system", content: prompt },
      {
        role: "user",
        content: [
          { type: "image_url", image_url: { url: imageUrl, detail: "high" } },
          {
            type: "text",
            text: "Please analyze this roofing shingle photo and identify the manufacturer, series, color, and production status. Cross-reference with the shingle database provided.",
          },
        ],
      },
    ],
  });
  const content = response.choices?.[0]?.message?.content;
  const text =
    typeof content === "string"
      ? content
      : Array.isArray(content)
        ? content
            .map((part) => ("text" in part ? part.text : ""))
            .join("\n")
        : "";
  return parseIdentifyResult(text);
}
