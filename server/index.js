import express from "express";
import { registerRoutes } from "./routes.js";
import { serveStatic } from "./static.js";
import { createServer } from "http";

import cors from "cors";
import { globalLimiter } from "./middleware/rateLimiter.js";

const app = express();
const httpServer = createServer(app);

// Enable Global Rate Limiter
app.use("/api", globalLimiter);

// Enable CORS for frontend dev server
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));







app.use(
  express.json({
    limit: '50mb',
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    }
  })
);

app.use(express.urlencoded({ extended: false }));

export function log(message, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  res.on("finish", () => {
    const duration = Date.now() - start;
    const logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
    log(logLine);
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err, _req, res, _next) => {
    const e = err;
    const status = e?.status ?? e?.statusCode ?? 500;
    const message = (err instanceof Error ? err.message : err?.message) ?? "Internal Server Error";

    // Enhanced logging
    if (status === 500) {
      console.error(`[Express Error] 500 - ${message}`);
      if (err instanceof Error && err.stack) console.error(err.stack);
      if (err.detail) console.error(`[DB Detail] ${err.detail}`);
    } else {
      console.warn(`[Express Warning] ${status} - ${message}`);
    }

    if (!res.headersSent) {
      res.status(status).json({
        success: false,
        message,
        details: process.env.NODE_ENV === "development" ? err.detail || err.hint : undefined
      });
    }
  });


  // Importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite.js");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();