import { afterEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn(),
}));

import { invokeLLM } from "./_core/llm";
import {
  identifyShingle,
  parseIdentifyResult,
  resolvePhotoForLlm,
  sanitizeInsuranceCopy,
} from "./shingleIdentify";

const TINY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);

afterEach(() => {
  vi.mocked(invokeLLM).mockReset();
  delete process.env.UPLOAD_DIR;
});

describe("parseIdentifyResult", () => {
  it("reads a named discontinued match from model JSON", () => {
    const result = parseIdentifyResult(`
Here is the match:
{
  "identified": true,
  "confidence": "HIGH",
  "manufacturer": "GAF",
  "series_name": "Camelot",
  "color": "Antique Slate",
  "production_status": "DISCONTINUED",
  "type": "Laminate/Architectural",
  "reasoning": "Tab-separation pattern matches Camelot I."
}
`);
    expect(result.identified).toBe(true);
    expect(result.manufacturer).toBe("GAF");
    expect(result.series_name).toBe("Camelot");
    expect(result.production_status).toBe("DISCONTINUED");
    expect(result.insurance_implications).toContain("Carriers still want proof");
  });

  it("returns identified false when the model sends no JSON", () => {
    const result = parseIdentifyResult("I cannot tell from this photo.");
    expect(result.identified).toBe(false);
    expect(result.reasoning).toContain("cannot tell");
  });
});

describe("sanitizeInsuranceCopy", () => {
  it("replaces automatic-approval language", () => {
    expect(
      sanitizeInsuranceCopy(
        "This discontinued shingle automatically approves a full roof claim."
      )
    ).toBe(
      "Discontinued plus storm damage is a strong full-roof fight. Carriers still want proof."
    );
  });

  it("keeps ordinary notes", () => {
    expect(sanitizeInsuranceCopy("Class 4 impact rating. Document the series.")).toBe(
      "Class 4 impact rating. Document the series."
    );
  });
});

describe("resolvePhotoForLlm", () => {
  it("leaves data URLs alone", async () => {
    const dataUrl = `data:image/png;base64,${TINY_PNG.toString("base64")}`;
    await expect(resolvePhotoForLlm(dataUrl)).resolves.toBe(dataUrl);
  });

  it("turns a local upload into a data URL so a remote model can see it", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "cc-uploads-"));
    process.env.UPLOAD_DIR = dir;
    const rel = path.join("supplement-uploads", "1", "shot.png");
    await fs.mkdir(path.dirname(path.join(dir, rel)), { recursive: true });
    await fs.writeFile(path.join(dir, rel), TINY_PNG);

    const resolved = await resolvePhotoForLlm(`/uploads/${rel}`);
    expect(resolved).toBe(`data:image/png;base64,${TINY_PNG.toString("base64")}`);
  });
});

describe("identifyShingle", () => {
  it("returns a named match and discontinued flag from the vision path", async () => {
    vi.mocked(invokeLLM).mockResolvedValue({
      id: "test",
      created: 0,
      model: "gpt-4o-mini",
      choices: [
        {
          index: 0,
          finish_reason: "stop",
          message: {
            role: "assistant",
            content: JSON.stringify({
              identified: true,
              confidence: "HIGH",
              manufacturer: "GAF",
              series_name: "Camelot",
              color: "Antique Slate",
              production_status: "DISCONTINUED",
              type: "Laminate/Architectural",
              visual_features_matched: ["Tab-separation at base"],
              reasoning: "Matches discontinued Camelot I.",
              insurance_implications:
                "Discontinued plus storm damage is a strong full-roof fight. Carriers still want proof.",
            }),
          },
        },
      ],
    });

    const result = await identifyShingle(
      `data:image/png;base64,${TINY_PNG.toString("base64")}`
    );

    expect(result.identified).toBe(true);
    expect(result.manufacturer).toBe("GAF");
    expect(result.series_name).toBe("Camelot");
    expect(result.production_status).toBe("DISCONTINUED");
    expect(vi.mocked(invokeLLM)).toHaveBeenCalledOnce();
    const payload = vi.mocked(invokeLLM).mock.calls[0]?.[0];
    const userContent = payload?.messages[1]?.content;
    expect(Array.isArray(userContent)).toBe(true);
    if (Array.isArray(userContent)) {
      const image = userContent.find((part) => typeof part !== "string" && part.type === "image_url");
      expect(image && image.type === "image_url" && image.image_url.url.startsWith("data:image/")).toBe(true);
    }
  });
});
