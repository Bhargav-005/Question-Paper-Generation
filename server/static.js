import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function serveStatic(app) {
  const distPath = path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(distPath));

  // Fallback to index.html for SPA routing
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
