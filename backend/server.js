import express from "express";
import cors from "cors";
import mysql from "mysql";

const app = express();
app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'brojo',
  password: 'AB12cd34@.',  // your MySQL password
  database: "MediPortal"
});

db.connect((err) => {
  if (err) console.log("❌ Database connection failed", err);
  else console.log("✅ Connected to MySQL database");
});

// Example route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// Start server
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
app.get("/users", (req, res) => {
  db.query("SELECT * FROM users", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

