import {
  Appointment,
  Department,
  Doctor,
  EmergencySector,
  Hospital,
  Patient,
  Report,
  Telemedicine,
  Ward,
} from '../models/index.js';
import { Op } from 'sequelize';
import { formatResponse } from '../utils/responseFormatter.js';
import { handleError } from '../utils/errorHandler.js';

// Public aggregate stats for landing/home page.
export const getPublicStats = async (req, res) => {
  try {
    const [
      doctors,
      patients,
      appointments,
      departments,
      wards,
      emergencyUnits,
      hospitals,
    ] = await Promise.all([
      Doctor.count(),
      Patient.count(),
      Appointment.count(),
      Department.count(),
      Ward.count(),
      EmergencySector.count(),
      Hospital.findAll({ attributes: ['name', 'location'], limit: 3 }),
    ]);

    return res.json(
      formatResponse(true, 'Public stats fetched', {
        doctors,
        patients,
        appointments,
        departments,
        facilities: wards + emergencyUnits,
        emergencyContact: '+1 234 567 890',
        aboutHospital:
          'MediPortal connects patients, doctors, nurses, and medical staff through one secure healthcare platform for appointments, telemedicine, reports, and coordinated care.',
        hospitals,
      })
    );
  } catch (err) {
    return handleError(res, err);
  }
};

// Private stats for patient dashboard cards.
export const getPatientDashboardSummary = async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const [upcomingAppointments, reports, teleconsultations, nextAppointment] = await Promise.all([
      Appointment.count({
        where: {
          P_ID: req.user.id,
          date: { [Op.gte]: today },
          status: { [Op.not]: 'REJECTED' },
        },
      }),
      Report.count({ where: { P_ID: req.user.id } }),
      Telemedicine.count({ where: { P_ID: req.user.id } }),
      Appointment.findOne({
        where: {
          P_ID: req.user.id,
          date: { [Op.gte]: today },
          status: { [Op.in]: ['SCHEDULED', 'ACCEPTED'] },
        },
        order: [['date', 'ASC'], ['time', 'ASC']],
        attributes: ['id', 'D_ID', 'date', 'time', 'status'],
      }),
    ]);

    return res.json(
      formatResponse(true, 'Patient dashboard summary fetched', {
        upcomingAppointments,
        reports,
        teleconsultations,
        nextAppointment,
      })
    );
  } catch (err) {
    return handleError(res, err);
  }
};
