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
  const UPLOADS_DIR = path.join(DATA_DIR, "uploads");

  // Ensure data and uploads directories exist
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Media upload endpoint (MP3, WAV, M4A, MP4, WebM, MOV, JPG, PNG)
  app.post("/api/upload-media", (req, res) => {
    try {
      const { name, data, type } = req.body;
      if (!data || !name) {
        return res.status(400).json({ success: false, error: "Missing file data or name" });
      }

      // Extract base64 payload
      const base64Data = data.includes(",") ? data.split(",")[1] : data;
      const buffer = Buffer.from(base64Data, "base64");

      const ext =
        path.extname(name) ||
        (type?.includes("audio")
          ? ".mp3"
          : type?.includes("video")
          ? ".mp4"
          : ".jpg");

      const safeBase = name.replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 20);
      const safeFilename = `${Date.now()}_${safeBase}${ext}`;
      const filePath = path.join(UPLOADS_DIR, safeFilename);

      fs.writeFileSync(filePath, buffer);
      console.log(`📁 Uploaded media stored at: ${filePath} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);

      const mediaUrl = `/api/media/${safeFilename}`;
      return res.json({
        success: true,
        url: mediaUrl,
        filename: safeFilename,
        name,
        size: buffer.length,
      });
    } catch (err: any) {
      console.error("Error saving media upload:", err);
      return res.status(500).json({ success: false, error: err.message || "Failed to save media upload" });
    }
  });

  // Media streaming endpoint with full HTTP 206 Partial Content Range support
  app.get("/api/media/:filename", (req, res) => {
    try {
      const filename = path.basename(req.params.filename);
      const filePath = path.join(UPLOADS_DIR, filename);

      if (!fs.existsSync(filePath)) {
        return res.status(404).send("Media file not found");
      }

      const stat = fs.statSync(filePath);
      const fileSize = stat.size;
      const range = req.headers.range;

      const ext = path.extname(filename).toLowerCase();
      const mimeTypes: Record<string, string> = {
        ".mp3": "audio/mpeg",
        ".wav": "audio/wav",
        ".ogg": "audio/ogg",
        ".m4a": "audio/mp4",
        ".aac": "audio/aac",
        ".mp4": "video/mp4",
        ".webm": "video/webm",
        ".mov": "video/quicktime",
        ".m4v": "video/mp4",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
        ".gif": "image/gif",
      };

      const contentType = mimeTypes[ext] || "application/octet-stream";

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = end - start + 1;
        const fileStream = fs.createReadStream(filePath, { start, end });

        res.writeHead(206, {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunkSize,
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000",
        });

        fileStream.pipe(res);
      } else {
        res.writeHead(200, {
          "Content-Length": fileSize,
          "Content-Type": contentType,
          "Accept-Ranges": "bytes",
          "Cache-Control": "public, max-age=31536000",
        });

        fs.createReadStream(filePath).pipe(res);
      }
    } catch (err: any) {
      console.error("Error streaming media:", err);
      res.status(500).send("Error streaming media");
    }
  });

  // GET all files in Media Folder library
  app.get("/api/media-list", (req, res) => {
    try {
      if (!fs.existsSync(UPLOADS_DIR)) {
        return res.json({ success: true, files: [] });
      }

      const fileNames = fs.readdirSync(UPLOADS_DIR);
      const files = fileNames
        .filter((fn) => !fn.startsWith("."))
        .map((fn) => {
          const filePath = path.join(UPLOADS_DIR, fn);
          const stat = fs.statSync(filePath);
          const ext = path.extname(fn).toLowerCase();

          let type: "audio" | "video" | "image" = "image";
          if ([".mp3", ".wav", ".ogg", ".m4a", ".aac"].includes(ext)) {
            type = "audio";
          } else if ([".mp4", ".webm", ".mov", ".m4v"].includes(ext)) {
            type = "video";
          }

          // Strip timestamp prefix for human readable name if present
          const cleanName = fn.replace(/^\d+_/, "");

          return {
            id: fn,
            filename: fn,
            name: cleanName || fn,
            type,
            url: `/api/media/${fn}`,
            size: stat.size,
            uploadedAt: stat.mtime.toISOString(),
          };
        })
        .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

      return res.json({ success: true, files });
    } catch (err: any) {
      console.error("Error listing media files:", err);
      return res.status(500).json({ success: false, error: "Failed to list media files" });
    }
  });

  // DELETE media file from library
  app.delete("/api/media/:filename", (req, res) => {
    try {
      const filename = path.basename(req.params.filename);
      const filePath = path.join(UPLOADS_DIR, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return res.json({ success: true, message: "File deleted successfully" });
      }
      return res.status(404).json({ success: false, error: "File not found" });
    } catch (err: any) {
      console.error("Error deleting media file:", err);
      return res.status(500).json({ success: false, error: "Failed to delete file" });
    }
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
