// src/controllers/nurseController.js
import Nurse from '../models/nurse.model.js';
import { formatResponse } from '../utils/responseFormatter.js';
import { handleError } from '../utils/errorHandler.js';

// Create a new nurse
export const createNurse = async (req, res) => {
  try {
    const nurse = await Nurse.create(req.body);
    res.status(201).json(formatResponse(true, 'Nurse added', nurse));
  } catch (err) {
    handleError(res, err);
  }
};

// Get all nurses
export const getAllNurses = async (req, res) => {
  try {
    const nurses = await Nurse.findAll();
    res.json(formatResponse(true, 'All nurses fetched', nurses));
  } catch (err) {
    handleError(res, err);
  }
};

// Get nurse by ID
export const getNurseById = async (req, res) => {
  try {
    const nurse = await Nurse.findByPk(req.params.id);
    if (!nurse) return res.status(404).json(formatResponse(false, 'Nurse not found'));
    res.json(formatResponse(true, 'Nurse fetched', nurse));
  } catch (err) {
    handleError(res, err);
  }
};

// Update nurse by ID
export const updateNurse = async (req, res) => {
  try {
    const [updatedCount, updatedNurses] = await Nurse.update(req.body, {
      where: { id: req.params.id },
      returning: true, // return updated row
    });
    if (updatedCount === 0) return res.status(404).json(formatResponse(false, 'Nurse not found'));
    res.json(formatResponse(true, 'Nurse updated', updatedNurses[0]));
  } catch (err) {
    handleError(res, err);
  }
};

// Delete nurse by ID
export const deleteNurse = async (req, res) => {
  try {
    const deleted = await Nurse.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json(formatResponse(false, 'Nurse not found'));
    res.json(formatResponse(true, 'Nurse deleted'));
  } catch (err) {
    handleError(res, err);
  }
};
