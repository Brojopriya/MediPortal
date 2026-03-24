import {
  Appointment,
  Department,
  Doctor,
  EmergencySector,
  Hospital,
  Patient,
  Report,
  Telemedicine,
  User,
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
      User.count({ where: { role: 'DOCTOR', approvalStatus: 'APPROVED' } }),
      User.count({ where: { role: 'PATIENT' } }),
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

// Private analytics for admin dashboard reporting.
export const getAdminAnalytics = async (req, res) => {
  try {
    const [
      appointmentsTotal,
      appointmentsScheduled,
      appointmentsAccepted,
      appointmentsCompleted,
      appointmentsRejected,
      reportsTotal,
      telemedicineSessions,
      hospitalsTotal,
      departmentsTotal,
      wardsTotal,
      emergencyUnitsTotal,
      usersTotal,
      approvedProfessionals,
      pendingProfessionals,
    ] = await Promise.all([
      Appointment.count(),
      Appointment.count({ where: { status: 'SCHEDULED' } }),
      Appointment.count({ where: { status: 'ACCEPTED' } }),
      Appointment.count({ where: { status: 'COMPLETED' } }),
      Appointment.count({ where: { status: 'REJECTED' } }),
      Report.count(),
      Telemedicine.count(),
      Hospital.count(),
      Department.count(),
      Ward.count(),
      EmergencySector.count(),
      User.count(),
      User.count({ where: { role: { [Op.in]: ['DOCTOR', 'NURSE', 'STAFF'] }, approvalStatus: 'APPROVED' } }),
      User.count({ where: { role: { [Op.in]: ['DOCTOR', 'NURSE', 'STAFF'] }, approvalStatus: 'PENDING' } }),
    ]);

    const appointmentTotal =
      appointmentsScheduled + appointmentsAccepted + appointmentsCompleted + appointmentsRejected;

    const appointmentStatusPie = [
      { label: 'Scheduled', value: appointmentsScheduled, color: '#0ea5e9' },
      { label: 'Accepted', value: appointmentsAccepted, color: '#22c55e' },
      { label: 'Completed', value: appointmentsCompleted, color: '#0f766e' },
      { label: 'Rejected', value: appointmentsRejected, color: '#ef4444' },
    ].map((item) => ({
      ...item,
      percentage: appointmentTotal ? Math.round((item.value / appointmentTotal) * 100) : 0,
    }));

    const facilityBar = [
      { label: 'Hospitals', value: hospitalsTotal },
      { label: 'Departments', value: departmentsTotal },
      { label: 'Wards', value: wardsTotal },
      { label: 'Emergency Units', value: emergencyUnitsTotal },
    ];

    return res.json(
      formatResponse(true, 'Admin analytics fetched', {
        appointments: {
          total: appointmentsTotal,
          scheduled: appointmentsScheduled,
          accepted: appointmentsAccepted,
          completed: appointmentsCompleted,
          rejected: appointmentsRejected,
        },
        reporting: {
          reportsTotal,
          telemedicineSessions,
        },
        facilities: {
          hospitalsTotal,
          departmentsTotal,
          wardsTotal,
          emergencyUnitsTotal,
        },
        users: {
          total: usersTotal,
          approvedProfessionals,
          pendingProfessionals,
        },
        charts: {
          appointmentStatusPie,
          facilityBar,
        },
      })
    );
  } catch (err) {
    return handleError(res, err);
  }
};
