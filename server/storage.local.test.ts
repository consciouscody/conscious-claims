import { afterEach, describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { storageGet, storagePut } from "./storage";

const TINY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);

afterEach(() => {
  delete process.env.UPLOAD_DIR;
});

describe("local disk storage", () => {
  it("writes a photo and returns a local /uploads URL", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "cc-store-"));
    process.env.UPLOAD_DIR = dir;

    const result = await storagePut(
      "supplement-uploads/1/shot.png",
      TINY_PNG,
      "image/png"
    );

    expect(result.url).toBe("/uploads/supplement-uploads/1/shot.png");
    const written = await fs.readFile(path.join(dir, "supplement-uploads/1/shot.png"));
    expect(written.equals(TINY_PNG)).toBe(true);

    const fetched = await storageGet("supplement-uploads/1/shot.png");
    expect(fetched.url).toBe("/uploads/supplement-uploads/1/shot.png");
  });
});
