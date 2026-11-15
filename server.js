require("dotenv").config();
const express = require("express");
const path = require("path");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 5,
});

app.use(express.json());

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello mula sa backend!", time: new Date().toISOString() });
});

app.get("/api/messages", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, name, text, created_at FROM messages ORDER BY id DESC LIMIT 50"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/api/messages", async (req, res) => {
  const name = (req.body.name || "").trim();
  const text = (req.body.text || "").trim();

  if (!name || !text || name.length > 50 || text.length > 200) {
    return res.status(400).json({ error: "Invalid na name o message" });
  }

  try {
    const { rows } = await pool.query(
      "INSERT INTO messages (name, text) VALUES ($1, $2) RETURNING id",
      [name, text]
    );
    res.status(201).json({ id: rows[0].id, name, text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.use(express.static(path.join(__dirname, "frontend")));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});