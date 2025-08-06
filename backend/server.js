// backend/server.js
const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Data file path
const dataPath = path.join(__dirname, "confessions.json");

// Helper function to read data
const readConfessions = () => {
  if (!fs.existsSync(dataPath)) return {};
  return JSON.parse(fs.readFileSync(dataPath, "utf-8"));
};

// Helper function to write data
const writeConfessions = (data) => {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
};

// Route to generate anonymous link
app.post("/api/create-link", (req, res) => {
  const userId = uuidv4();
  const confessions = readConfessions();
  confessions[userId] = []; // Create new user confession board
  writeConfessions(confessions);
  res.json({ link: `/confess.html?user=${userId}`, userId });
});

// Route to submit anonymous message
app.post("/api/confess/:userId", (req, res) => {
  const { userId } = req.params;
  const { message } = req.body;

  if (!message || message.trim() === "") {
    return res.status(400).json({ error: "Message cannot be empty." });
  }

  const confessions = readConfessions();
  if (!confessions[userId]) {
    return res.status(404).json({ error: "Invalid confession board." });
  }

  confessions[userId].push({ message, time: new Date() });
  writeConfessions(confessions);

  res.json({ success: true });
});

// Route to fetch all messages for a user
app.get("/api/confess/:userId", (req, res) => {
  const { userId } = req.params;
  const confessions = readConfessions();

  if (!confessions[userId]) {
    return res.status(404).json({ error: "Confession board not found." });
  }

  res.json(confessions[userId]);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
