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

  if (!entry || !entry.event || !entry.message) {
    return res.status(400).json({ error: "Invalid log entry" });
  }

  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] [${entry.event}] user=${entry.user || "null"} message="${entry.message}"\n`;

  fs.appendFile(LOG_FILE, line, (err) => {
    if (err) {
      console.error("Failed writing log:", err);
      return res.status(500).json({ error: "Failed to write log" });
    }
    return res.json({ status: "logged" });
  });
});

// Start server
const PORT = 6000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Logging server running on port ${PORT}`);
});
