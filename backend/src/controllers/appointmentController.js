// src/controllers/appointmentController.js
import Appointment from '../models/appointment.model.js';
import { formatResponse } from '../utils/responseFormatter.js';
import { handleError } from '../utils/errorHandler.js';

// Create a new appointment
export const createAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.create(req.body);
    res.status(201).json(formatResponse(true, 'Appointment created', appointment));
  } catch (err) {
    handleError(res, err);
  }
};

// Get all appointments
export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll();
    res.json(formatResponse(true, 'All appointments fetched', appointments));
  } catch (err) {
    handleError(res, err);
  }
};

// Get appointment by ID
export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) return res.status(404).json(formatResponse(false, 'Appointment not found'));
    res.json(formatResponse(true, 'Appointment fetched', appointment));
  } catch (err) {
    handleError(res, err);
  }
};

// Update appointment by ID
export const updateAppointment = async (req, res) => {
  try {
    const [updatedCount, updatedAppointments] = await Appointment.update(req.body, {
      where: { id: req.params.id },
      returning: true, // returns the updated record
    });
    if (updatedCount === 0) return res.status(404).json(formatResponse(false, 'Appointment not found'));
    res.json(formatResponse(true, 'Appointment updated', updatedAppointments[0]));
  } catch (err) {
    handleError(res, err);
  }
};

// Delete appointment by ID
export const deleteAppointment = async (req, res) => {
  try {
    const deleted = await Appointment.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json(formatResponse(false, 'Appointment not found'));
    res.json(formatResponse(true, 'Appointment deleted'));
  } catch (err) {
    handleError(res, err);
  }
};
