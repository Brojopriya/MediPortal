// server.js
import express from "express";
import cors from "cors";

// Import routes
import doctorRoutes from "./routes/doctors.js";
import serviceRoutes from "./routes/services.js";
import appointmentRoutes from "./routes/appointments.js"; // Make sure you have this

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/doctors", doctorRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/appointments", appointmentRoutes); // Existing route

// Default route
app.get("/", (req, res) => {
  res.send("Welcome to MediPortal API");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
