// src/controllers/nurseController.js
import { Op } from 'sequelize';
import { Appointment, Nurse, NursePatient, Report, User } from '../models/index.js';
import { formatResponse } from '../utils/responseFormatter.js';
import { handleError } from '../utils/errorHandler.js';

const getAssignedPatientIds = async (nurseId) => {
  const mappings = await NursePatient.findAll({ where: { N_ID: nurseId }, attributes: ['P_ID'] });
  return mappings.map((m) => m.P_ID).filter((id) => Number.isInteger(id));
};

export const getNurseDashboardSummary = async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const patientIds = await getAssignedPatientIds(req.user.id);

    if (!patientIds.length) {
      return res.json(formatResponse(true, 'Nurse dashboard summary fetched', {
        assignedPatients: 0,
        appointmentsToday: 0,
        pendingAppointments: 0,
        completedAppointments: 0,
        pendingReports: 0,
      }));
    }

    const [appointmentsToday, pendingAppointments, completedAppointments, pendingReports] = await Promise.all([
      Appointment.count({ where: { P_ID: { [Op.in]: patientIds }, date: today } }),
      Appointment.count({ where: { P_ID: { [Op.in]: patientIds }, status: { [Op.in]: ['SCHEDULED', 'ACCEPTED'] } } }),
      Appointment.count({ where: { P_ID: { [Op.in]: patientIds }, status: 'COMPLETED' } }),
      Report.count({ where: { P_ID: { [Op.in]: patientIds }, status: 'PENDING' } }),
    ]);

    return res.json(formatResponse(true, 'Nurse dashboard summary fetched', {
      assignedPatients: patientIds.length,
      appointmentsToday,
      pendingAppointments,
      completedAppointments,
      pendingReports,
    }));
  } catch (err) {
    return handleError(res, err);
  }
};

export const getMyNursePatients = async (req, res) => {
  try {
    const patientIds = await getAssignedPatientIds(req.user.id);
    if (!patientIds.length) {
      return res.json(formatResponse(true, 'Assigned nurse patients fetched', []));
    }

    const [patients, latestAppointments] = await Promise.all([
      User.findAll({
        where: { id: patientIds },
        attributes: ['id', 'name', 'email', 'phone', 'gender'],
      }),
      Appointment.findAll({
        where: { P_ID: { [Op.in]: patientIds } },
        attributes: ['P_ID', 'date', 'status'],
        order: [['date', 'DESC']],
      }),
    ]);

    const latestByPatient = new Map();
    latestAppointments.forEach((row) => {
      if (!latestByPatient.has(row.P_ID)) {
        latestByPatient.set(row.P_ID, { lastVisit: row.date, lastStatus: row.status });
      }
    });

    const payload = patients.map((p) => {
      const latest = latestByPatient.get(p.id) || {};
      return {
        id: p.id,
        name: p.name,
        email: p.email,
        phone: p.phone,
        gender: p.gender,
        lastVisit: latest.lastVisit || null,
        lastAppointmentStatus: latest.lastStatus || null,
      };
    });

    return res.json(formatResponse(true, 'Assigned nurse patients fetched', payload));
  } catch (err) {
    return handleError(res, err);
  }
};

export const getNurseSchedule = async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const patientIds = await getAssignedPatientIds(req.user.id);
    if (!patientIds.length) {
      return res.json(formatResponse(true, 'Nurse schedule fetched', []));
    }

    const appointments = await Appointment.findAll({
      where: {
        P_ID: { [Op.in]: patientIds },
        date: { [Op.gte]: today },
      },
      attributes: ['id', 'P_ID', 'D_ID', 'date', 'time', 'status'],
      order: [['date', 'ASC'], ['time', 'ASC']],
      limit: 25,
    });

    const uniquePatientIds = [...new Set(appointments.map((a) => a.P_ID))];
    const patients = await User.findAll({
      where: { id: uniquePatientIds },
      attributes: ['id', 'name'],
    });
    const patientMap = new Map(patients.map((p) => [p.id, p.name]));

    const payload = appointments.map((a) => ({
      id: a.id,
      date: a.date,
      time: a.time,
      status: a.status,
      patientId: a.P_ID,
      patientName: patientMap.get(a.P_ID) || `Patient #${a.P_ID}`,
      doctorId: a.D_ID,
    }));

    return res.json(formatResponse(true, 'Nurse schedule fetched', payload));
  } catch (err) {
    return handleError(res, err);
  }
};

// Get logged-in nurse's full profile (User + Nurse sub-table)
export const getMyNurseProfile = async (req, res) => {
  try {
    const [user, nurse] = await Promise.all([
      User.findByPk(req.user.id),
      Nurse.findByPk(req.user.id),
    ]);
    if (!user) return res.status(404).json(formatResponse(false, 'User not found'));

    return res.json(formatResponse(true, 'Nurse profile fetched', {
      id:             user.id,
      name:           user.name,
      email:          user.email,
      phone:          user.phone,
      address:        user.address,
      gender:         user.gender,
      profileUrl:     user.profileUrl,
      dateOfBirth:    nurse?.dateOfBirth    || '',
      employeeId:     nurse?.employeeId     || '',
      department:     nurse?.department     || '',
      shift:          nurse?.shift          || nurse?.timeSchedule || '',
      specialization: nurse?.specialization || '',
      licenseNumber:  nurse?.licenseNumber  || '',
      joiningDate:    nurse?.joiningDate    || '',
      experience:     nurse?.experience     || '',
      qualifications: nurse?.qualifications || '',
      post:           nurse?.post           || '',
    }));
  } catch (err) {
    return handleError(res, err);
  }
};

// Update logged-in nurse's profile
export const updateMyNurseProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json(formatResponse(false, 'User not found'));

    const [nurse] = await Nurse.findOrCreate({
      where: { id: req.user.id },
      defaults: { id: req.user.id },
    });

    const userFields = ['name', 'phone', 'address', 'gender', 'profileUrl'];
    const userUpdates = {};
    for (const f of userFields) {
      if (req.body[f] !== undefined) userUpdates[f] = req.body[f];
    }

    if (req.body.email !== undefined) {
      const next = String(req.body.email || '').trim().toLowerCase();
      if (!next) return res.status(400).json(formatResponse(false, 'Email cannot be empty'));
      const existing = await User.findOne({ where: { email: next } });
      if (existing && existing.id !== user.id)
        return res.status(400).json(formatResponse(false, 'Email already in use'));
      userUpdates.email = next;
    }

    const nurseFields = ['dateOfBirth','employeeId','department','shift','specialization','licenseNumber','joiningDate','experience','qualifications','post'];
    const nurseUpdates = {};
    for (const f of nurseFields) {
      if (req.body[f] !== undefined) nurseUpdates[f] = req.body[f];
    }
    if (nurseUpdates.shift) nurseUpdates.timeSchedule = nurseUpdates.shift;

    await Promise.all([
      Object.keys(userUpdates).length ? user.update(userUpdates) : Promise.resolve(),
      Object.keys(nurseUpdates).length ? nurse.update(nurseUpdates) : Promise.resolve(),
    ]);

    return res.json(formatResponse(true, 'Nurse profile updated', {
      id:             user.id,
      name:           userUpdates.name        ?? user.name,
      email:          userUpdates.email       ?? user.email,
      phone:          userUpdates.phone       ?? user.phone,
      address:        userUpdates.address     ?? user.address,
      gender:         userUpdates.gender      ?? user.gender,
      profileUrl:     userUpdates.profileUrl  ?? user.profileUrl,
      dateOfBirth:    nurseUpdates.dateOfBirth    ?? nurse.dateOfBirth    ?? '',
      employeeId:     nurseUpdates.employeeId     ?? nurse.employeeId     ?? '',
      department:     nurseUpdates.department     ?? nurse.department     ?? '',
      shift:          nurseUpdates.shift          ?? nurse.shift          ?? '',
      specialization: nurseUpdates.specialization ?? nurse.specialization ?? '',
      licenseNumber:  nurseUpdates.licenseNumber  ?? nurse.licenseNumber  ?? '',
      joiningDate:    nurseUpdates.joiningDate     ?? nurse.joiningDate    ?? '',
      experience:     nurseUpdates.experience     ?? nurse.experience     ?? '',
      qualifications: nurseUpdates.qualifications ?? nurse.qualifications ?? '',
      post:           nurseUpdates.post           ?? nurse.post           ?? '',
    }));
  } catch (err) {
    return handleError(res, err);
  }
};

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
