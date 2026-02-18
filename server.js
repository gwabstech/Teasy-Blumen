const express = require("express");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, "db.json");
const API_KEY = process.env.API_KEY || "teasy-secret-key-123";

// Swagger Setup
const swaggerDocument = YAML.load(path.join(__dirname, "docs/swagger.yaml"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Simple credentials (as requested)
const CREDENTIALS = { username: "blumen", password: "123456" };

// Middleware to check API Key
const checkApiKey = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey || apiKey !== API_KEY) {
    return res.status(401).json({ error: "Invalid or missing API Key" });
  }
  next();
};

// Helper to read DB
function readDb() {
  try {
    const data = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading DB:", err);
    return [];
  }
}

// Helper to write DB
function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("Error writing DB:", err);
    return false;
  }
}

// In-memory session store: token -> username
const sessions = {};

function generateToken() {
  return crypto.randomBytes(16).toString("hex");
}

/* 
  API for POS Device Authentication 
  1. Add POS (Serial + Passcode)
  2. Get Passcode by Serial
*/

// Add new POS device
// POST /api/pos
// Headers: x-api-key
// Body: { serial: "...", passcode: "..." }
app.post("/api/pos", checkApiKey, (req, res) => {
  const { serial, passcode } = req.body;
  if (!serial || !passcode) {
    return res.status(400).json({ error: "Serial and Passcode are required" });
  }

  const devices = readDb();
  
  // Check if exists
  const exists = devices.find(d => d["POS Serial"] === serial);
  if (exists) {
    return res.status(409).json({ error: "Device with this serial already exists" });
  }

  const newDevice = {
    "POS Serial": serial,
    "Passcode": passcode,
    "Agent First Name": "ADDED VIA API", // Default value
    "Current Balance": "0"
  };

  devices.push(newDevice);
  if (writeDb(devices)) {
    return res.json({ message: "Device added successfully", device: newDevice });
  } else {
    return res.status(500).json({ error: "Failed to save device" });
  }
});

// Get passcode by serial
// GET /api/pos/:serial
// Headers: x-api-key
app.get("/api/pos/:serial", checkApiKey, (req, res) => {
  const serial = req.params.serial;
  const devices = readDb();
  const device = devices.find(d => d["POS Serial"] === serial);

  if (device) {
    return res.json({ 
      serial: device["POS Serial"], 
      passcode: device["Passcode"] 
    });
  } else {
    return res.status(404).json({ error: "Device not found" });
  }
});


// Existing Login Logic
app.post("/api/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password)
    return res.status(400).json({ message: "username and password required" });
  if (username === CREDENTIALS.username && password === CREDENTIALS.password) {
    const token = generateToken();
    sessions[token] = { username, created: Date.now() };
    return res.json({ token });
  }
  return res.status(401).json({ message: "invalid credentials" });
});

// Redirect root to the main HTML file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "teasy devices.html"));
});

// Existing GET /api/devices with DB integration
app.get("/api/devices", (req, res) => {
  const devices = readDb();
  const serial = (req.query.serial || "").trim();
  
  if (serial) {
    const q = serial.toLowerCase();
    const found = devices.filter(
      (d) => (d["POS Serial"] || "").toLowerCase() === q
    );
    return res.json(found);
  }

  const auth = req.headers["authorization"] || "";
  const m = auth.match(/^Bearer\s+(\S+)$/i);
  if (!m) return res.status(401).json({ message: "authorization required" });
  const token = m[1];
  if (!sessions[token])
    return res.status(401).json({ message: "invalid or expired token" });

  return res.json(devices);
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
