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

console.log('[statsController] MODULE LOADED - getPublicStats available');

const safeCount = async (model, options = {}) => {
  try {
    return await model.count(options);
  } catch (err) {
    const code = err?.parent?.code || err?.original?.code || err?.code;
    console.error('[safeCount]', model.name, 'error code:', code, 'msg:', err.message);
    if (code === 'ER_NO_SUCH_TABLE' || code === 'ER_BAD_FIELD_ERROR') {
      console.log('[safeCount] Returning 0 for code:', code);
      return 0;
    }
    console.error('[safeCount] Throwing error for code:', code);
    throw err;
  }
};

// Public aggregate stats for landing/home page.
export const getPublicStats = async (req, res) => {
  try {
    console.log('🔍 DEBUG: getPublicStats called');
    const [
      doctors,
      patientUsers,
      patientProfiles,
      appointments,
      departments,
      wards,
      emergencyUnits,
      hospitals,
    ] = await Promise.allSettled([
      safeCount(User, { where: { role: 'DOCTOR', approvalStatus: 'APPROVED' } }),
      safeCount(User, {
        where: {
          [Op.or]: [{ role: 'PATIENT' }, { role: 'patient' }, { role: 'Patient' }],
        },
      }),
      safeCount(Patient),
      safeCount(Appointment),
      safeCount(Department),
      safeCount(Ward),
      safeCount(EmergencySector),
      Hospital.findAll({ attributes: ['name', 'location'], limit: 3 }).catch(() => []),
    ]);
    
    const extractValue = (result) => {
      if (result.status === 'fulfilled') return result.value ?? 0;
      console.error('Settlement error:', result.reason?.message);
      return 0;
    };
    
    const docCount = extractValue(doctors);
    const patientUsersCount = extractValue(patientUsers);
    const patientProfilesCount = extractValue(patientProfiles);
    const patCount = Math.max(patientUsersCount, patientProfilesCount);
    const apptCount = extractValue(appointments);
    const deptCount = extractValue(departments);
    const wardCount = extractValue(wards);
    const emergencyCount = extractValue(emergencyUnits);
    const hospitalList = hospitals.status === 'fulfilled' ? (hospitals.value ?? []) : [];
    
    console.log('🔍 DEBUG: counts retrieved - doctors:', docCount, 'patients:', patCount);

    return res.json(
      formatResponse(true, 'Public stats fetched', {
        doctors: docCount,
        patients: patCount,
        appointments: apptCount,
        departments: deptCount,
        facilities: wardCount + emergencyCount,
        emergencyContact: '+1 234 567 890',
        aboutHospital:
          'MediPortal connects patients, doctors, nurses, and medical staff through one secure healthcare platform for appointments, telemedicine, reports, and coordinated care.',
        hospitals: hospitalList,
      })
    );
  } catch (err) {
    console.error('🔥 DEBUG: Error in getPublicStats:', err.message, err.code, err?.parent?.code);
    // Return default stats instead of error to prevent home page from breaking
    return res.json(
      formatResponse(true, 'Public stats fetched (defaults)', {
        doctors: 0,
        patients: 0,
        appointments: 0,
        departments: 0,
        facilities: 0,
        emergencyContact: '+1 234 567 890',
        aboutHospital: 'MediPortal connects patients, doctors, nurses, and medical staff through one secure healthcare platform for appointments, telemedicine, reports, and coordinated care.',
        hospitals: [],
      })
    );
  }
};

// Private stats for patient dashboard cards.
export const getPatientDashboardSummary = async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const [upcomingAppointments, reports, teleconsultations, nextAppointment] = await Promise.all([
      safeCount(Appointment, {
        where: {
          P_ID: req.user.id,
          date: { [Op.gte]: today },
          status: { [Op.not]: 'REJECTED' },
        },
      }),
      safeCount(Report, { where: { P_ID: req.user.id } }),
      safeCount(Telemedicine, { where: { P_ID: req.user.id } }),
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
      safeCount(Appointment),
      safeCount(Appointment, { where: { status: 'SCHEDULED' } }),
      safeCount(Appointment, { where: { status: 'ACCEPTED' } }),
      safeCount(Appointment, { where: { status: 'COMPLETED' } }),
      safeCount(Appointment, { where: { status: 'REJECTED' } }),
      safeCount(Report),
      safeCount(Telemedicine),
      safeCount(Hospital),
      safeCount(Department),
      safeCount(Ward),
      safeCount(EmergencySector),
      safeCount(User),
      safeCount(User, { where: { role: { [Op.in]: ['DOCTOR', 'NURSE', 'STAFF'] }, approvalStatus: 'APPROVED' } }),
      safeCount(User, { where: { role: { [Op.in]: ['DOCTOR', 'NURSE', 'STAFF'] }, approvalStatus: 'PENDING' } }),
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
