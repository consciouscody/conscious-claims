import { describe, expect, it } from "vitest";
import { isLlmConfigured, resolveLlmConfig } from "./_core/llm";

describe("LLM config without Manus", () => {
  it("points at OpenAI when only OPENAI_API_KEY would be set later", () => {
    const config = resolveLlmConfig();
    expect(config.completionsUrl).toBe("https://api.openai.com/v1/chat/completions");
    expect(config.model).toBe("gpt-4o-mini");
    expect(config.geminiStyle).toBe(false);
    expect(isLlmConfigured()).toBe(false);
  });
});
