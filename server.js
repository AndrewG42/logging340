const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

// Log file location
const LOG_DIR = "/var/log/fixit";
const LOG_FILE = path.join(LOG_DIR, "activity.log");

// Ensure directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// POST /log (receive logs from backend)
app.post("/log", (req, res) => {
  const entry = req.body;

  console.log("[DEBUG] Received payload:", entry);

  // Required fields (userId may be null)
  if (!entry.action || !entry.timestamp || !entry.source) {
    return res.status(400).json({ error: "Invalid log entry" });
  }

  const logLine =
    `[${entry.timestamp}] ` +
    `[${entry.action}] ` +
    `user=${entry.userId ?? "null"} ` +
    `message="${entry.details || ""}" ` +
    `source=${entry.source}\n`;

  fs.appendFile("/var/log/fixit/activity.log", logLine, (err) => {
    if (err) {
      console.error("[ERROR] Failed to write log:", err);
      return res.status(500).json({ error: "Write error" });
    }

    console.log("[DEBUG] Log written:", logLine);
    return res.json({ status: "ok" });
  });
});

// Start server
const PORT = 5001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Logging server running on port ${PORT}`);
});
