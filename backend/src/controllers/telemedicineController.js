// src/controllers/telemedicineController.js
import Telemedicine from '../models/telemedicine.model.js';
import { formatResponse } from '../utils/responseFormatter.js';
import { handleError } from '../utils/errorHandler.js';

// Start a new telemedicine session
export const startSession = async (req, res) => {
  try {
    const session = await Telemedicine.create(req.body);
    res.status(201).json(formatResponse(true, 'Telemedicine session started', session));
  } catch (err) {
    handleError(res, err);
  }
};

// Get session by ID
export const getSessionById = async (req, res) => {
  try {
    const session = await Telemedicine.findByPk(req.params.id);
    if (!session) return res.status(404).json(formatResponse(false, 'Session not found'));
    res.json(formatResponse(true, 'Session details fetched', session));
  } catch (err) {
    handleError(res, err);
  }
};

// Update session by ID
export const updateSession = async (req, res) => {
  try {
    const [updatedCount, updatedSessions] = await Telemedicine.update(req.body, {
      where: { id: req.params.id },
      returning: true,
    });
    if (updatedCount === 0) return res.status(404).json(formatResponse(false, 'Session not found'));
    res.json(formatResponse(true, 'Session updated', updatedSessions[0]));
  } catch (err) {
    handleError(res, err);
  }
};

// End session by ID
export const endSession = async (req, res) => {
  try {
    const deleted = await Telemedicine.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json(formatResponse(false, 'Session not found'));
    res.json(formatResponse(true, 'Telemedicine session ended'));
  } catch (err) {
    handleError(res, err);
  }
};
