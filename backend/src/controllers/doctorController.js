// src/controllers/doctorController.js
import Doctor from '../models/doctor.model.js';
import { formatResponse } from '../utils/responseFormatter.js';
import { handleError } from '../utils/errorHandler.js';

// Create a new doctor
export const createDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.create(req.body);
    res.status(201).json(formatResponse(true, 'Doctor added', doctor));
  } catch (err) {
    handleError(res, err);
  }
};

// Get all doctors
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.findAll();
    res.json(formatResponse(true, 'All doctors fetched', doctors));
  } catch (err) {
    handleError(res, err);
  }
};

// Get doctor by ID
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id);
    if (!doctor) return res.status(404).json(formatResponse(false, 'Doctor not found'));
    res.json(formatResponse(true, 'Doctor fetched', doctor));
  } catch (err) {
    handleError(res, err);
  }
};

// Update doctor by ID
export const updateDoctor = async (req, res) => {
  try {
    const [updatedCount, updatedDoctors] = await Doctor.update(req.body, {
      where: { id: req.params.id },
      returning: true, // returns updated record
    });
    if (updatedCount === 0) return res.status(404).json(formatResponse(false, 'Doctor not found'));
    res.json(formatResponse(true, 'Doctor updated', updatedDoctors[0]));
  } catch (err) {
    handleError(res, err);
  }
};

// Delete doctor by ID
export const deleteDoctor = async (req, res) => {
  try {
    const deleted = await Doctor.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json(formatResponse(false, 'Doctor not found'));
    res.json(formatResponse(true, 'Doctor deleted'));
  } catch (err) {
    handleError(res, err);
  }
};
