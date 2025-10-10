import express from "express";
import { models } from "../db.js";

const router = express.Router();

// GET all doctors
router.get("/", async (req, res) => {
  try {
    const doctors = await models.Doctor.findAll();
    res.json(doctors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch doctors" });
  }
});

export default router;
