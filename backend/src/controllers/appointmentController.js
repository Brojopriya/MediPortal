// src/controllers/appointmentController.js
import { Appointment, User } from '../models/index.js';
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

// Patient books an appointment with a doctor.
export const bookAppointment = async (req, res) => {
  try {
    const { date, time, D_ID } = req.body;
    if (!date || !time || !D_ID) {
      return res.status(400).json(formatResponse(false, 'date, time, and D_ID are required'));
    }

    const appointment = await Appointment.create({
      date,
      time,
      D_ID,
      P_ID: req.user.id,
    });

    return res.status(201).json(formatResponse(true, 'Appointment booked successfully', appointment));
  } catch (err) {
    return handleError(res, err);
  }
};

// Patient sees their own appointments.
export const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      where: { P_ID: req.user.id },
      order: [['date', 'DESC'], ['time', 'DESC']],
    });
    return res.json(formatResponse(true, 'My appointments fetched', appointments));
  } catch (err) {
    return handleError(res, err);
  }
};

// Doctor sees appointments assigned to them.
export const getDoctorAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      where: { D_ID: req.user.id },
      order: [['date', 'DESC'], ['time', 'DESC']],
    });

    const patientIds = [...new Set(appointments.map((a) => a.P_ID).filter(Boolean))];
    const patients = patientIds.length
      ? await User.findAll({
          where: { id: patientIds },
          attributes: ['id', 'name', 'email', 'phone'],
        })
      : [];

    const patientMap = new Map(patients.map((p) => [p.id, p]));
    const payload = appointments.map((appointment) => {
      const row = appointment.toJSON();
      const patient = row.P_ID ? patientMap.get(row.P_ID) : null;
      return {
        ...row,
        patientName: patient?.name || null,
        patientEmail: patient?.email || null,
        patientPhone: patient?.phone || null,
      };
    });

    return res.json(formatResponse(true, 'Doctor appointments fetched', payload));
  } catch (err) {
    return handleError(res, err);
  }
};
