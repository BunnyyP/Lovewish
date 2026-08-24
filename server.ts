import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support large body payloads for custom uploaded audio/video/images if needed
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  const DATA_DIR = path.join(process.cwd(), "data");
  const CONFIG_FILE = path.join(DATA_DIR, "config.json");

  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // GET global shared birthday config for all visitors
  app.get("/api/config", (req, res) => {
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        const raw = fs.readFileSync(CONFIG_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        return res.json({ success: true, config: parsed });
      }
      return res.json({ success: true, config: null });
    } catch (err) {
      console.error("Error reading global config:", err);
      return res.status(500).json({ success: false, error: "Failed to read global config" });
    }
  });

  // POST global shared birthday config (saves changes for all visitors everywhere)
  app.post("/api/config", (req, res) => {
    try {
      const config = req.body;
      if (!config || typeof config !== "object") {
        return res.status(400).json({ success: false, error: "Invalid config payload" });
      }

      fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
      return res.json({
        success: true,
        message: "Customized surprise configuration saved globally for all visitors!",
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Error saving global config:", err);
      return res.status(500).json({ success: false, error: "Failed to save global config" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Romantic Surprise Server running on port ${PORT}`);
  });
}

startServer();
