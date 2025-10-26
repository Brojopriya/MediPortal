// src/controllers/patientController.js
import Patient from '../models/patient.model.js';
import { formatResponse } from '../utils/responseFormatter.js';
import { handleError } from '../utils/errorHandler.js';

// Create a new patient
export const createPatient = async (req, res) => {
  try {
    const patient = await Patient.create(req.body);
    res.status(201).json(formatResponse(true, 'Patient created', patient));
  } catch (err) {
    handleError(res, err);
  }
};

// Get all patients
export const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.findAll();
    res.json(formatResponse(true, 'All patients fetched', patients));
  } catch (err) {
    handleError(res, err);
  }
};

// Get patient by ID
export const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) return res.status(404).json(formatResponse(false, 'Patient not found'));
    res.json(formatResponse(true, 'Patient fetched', patient));
  } catch (err) {
    handleError(res, err);
  }
};

// Update patient by ID
export const updatePatient = async (req, res) => {
  try {
    const [updatedCount, updatedPatients] = await Patient.update(req.body, {
      where: { id: req.params.id },
      returning: true,
    });
    if (updatedCount === 0) return res.status(404).json(formatResponse(false, 'Patient not found'));
    res.json(formatResponse(true, 'Patient updated', updatedPatients[0]));
  } catch (err) {
    handleError(res, err);
  }
};

// Delete patient by ID
export const deletePatient = async (req, res) => {
  try {
    const deleted = await Patient.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json(formatResponse(false, 'Patient not found'));
    res.json(formatResponse(true, 'Patient deleted'));
  } catch (err) {
    handleError(res, err);
  }
};
