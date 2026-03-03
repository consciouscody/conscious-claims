import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // Try both possible production paths
  const distPathA = path.resolve(import.meta.dirname, "public");
  const distPathB = path.resolve(import.meta.dirname, "../..", "dist", "public");
  const distPath = fs.existsSync(distPathA) ? distPathA : distPathB;

  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  // Explicitly serve image files with correct MIME types BEFORE the static middleware
  // This ensures favicon and OG images are never intercepted by the SPA fallback
  const imageFiles: Record<string, string> = {
    "/favicon.ico": "image/x-icon",
    "/favicon.png": "image/png",
    "/favicon-32.png": "image/png",
    "/icon-512.png": "image/png",
    "/og-image.jpg": "image/jpeg",
    "/og-image.png": "image/png",
  };

  for (const [urlPath, mimeType] of Object.entries(imageFiles)) {
    app.get(urlPath, (req, res) => {
      const filePath = path.resolve(distPath, urlPath.slice(1));
      if (fs.existsSync(filePath)) {
        res.setHeader("Content-Type", mimeType);
        res.setHeader("Cache-Control", "public, max-age=86400");
        res.sendFile(filePath);
      } else {
        res.status(404).send("Not found");
      }
    });
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
