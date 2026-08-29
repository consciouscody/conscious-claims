import { Router, Request, Response } from "express";
import multer from "multer";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import { resolveRequestUser } from "./_core/localAuth";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/heic", "application/pdf"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only images (JPEG, PNG, WEBP, HEIC) and PDF files are allowed"));
    }
  },
});

export const uploadRouter = Router();

// Upload a file (photo or PDF) for a job
uploadRouter.post("/api/upload", upload.single("file"), async (req: Request, res: Response) => {
  try {
    // Verify auth
    const user = await resolveRequestUser(req);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: "No file provided" });
      return;
    }

    const file = req.file;
    const ext = file.originalname.split(".").pop()?.toLowerCase() || "bin";
    const suffix = nanoid(8);
    const fileKey = `supplement-uploads/${user.id}/${suffix}.${ext}`;

    const { url } = await storagePut(fileKey, file.buffer, file.mimetype);

    res.json({
      url,
      fileKey,
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });
  } catch (err: any) {
    console.error("[Upload] Error:", err);
    res.status(500).json({ error: err.message || "Upload failed" });
  }
});
