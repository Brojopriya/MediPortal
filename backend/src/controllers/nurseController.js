// src/controllers/nurseController.js
import { Op } from 'sequelize';
import {
  Appointment,
  Department,
  Doctor,
  EmergencySector,
  Hospital,
  MedicalStaff,
  Nurse,
  NursePatient,
  Report,
  User,
} from '../models/index.js';
import { formatResponse } from '../utils/responseFormatter.js';
import { handleError } from '../utils/errorHandler.js';

const normalizeName = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const getAssignedPatientIds = async (nurseId) => {
  const mappings = await NursePatient.findAll({ where: { N_ID: nurseId }, attributes: ['P_ID'] });
  return mappings.map((m) => m.P_ID).filter((id) => Number.isInteger(id));
};

const getNurseDepartmentContext = async (nurseId) => {
  const nurse = await Nurse.findByPk(nurseId, {
    attributes: ['id', 'department'],
  });

  if (!nurse) {
    return {
      nurse: null,
      departmentId: null,
      departmentName: '',
    };
  }

  let departmentId = null;
  let departmentName = String(nurse.department || '').trim();

  if (departmentName) {
    const department = await Department.findOne({
      where: { name: departmentName },
      attributes: ['id', 'name'],
    });
    if (department) {
      departmentId = department.id;
      departmentName = String(department.name || departmentName);
    }
  }

  return {
    nurse,
    departmentId,
    departmentName,
  };
};

const getDepartmentDoctorIds = async ({ departmentId, departmentName }) => {
  const whereClause = {};

  if (departmentId) {
    whereClause.Dept_ID = departmentId;
  } else if (departmentName) {
    whereClause.department = departmentName;
  } else {
    return [];
  }

  const doctors = await Doctor.findAll({ where: whereClause, attributes: ['id'] });
  let doctorIds = doctors.map((doctor) => doctor.id).filter((id) => Number.isInteger(id));

  // Fallback for naming mismatches, e.g. "Dermatology" vs "Dermatology & Venereology".
  if (!doctorIds.length && departmentName && !departmentId) {
    const normalizedDepartment = normalizeName(departmentName);
    const allDoctors = await Doctor.findAll({ attributes: ['id', 'department'] });
    doctorIds = allDoctors
      .filter((doctor) => {
        const doctorDepartment = normalizeName(doctor.department);
        return (
          doctorDepartment === normalizedDepartment ||
          doctorDepartment.includes(normalizedDepartment) ||
          normalizedDepartment.includes(doctorDepartment)
        );
      })
      .map((doctor) => doctor.id)
      .filter((id) => Number.isInteger(id));
  }

  return [...new Set(doctorIds)];
};

const getDepartmentPatientIds = async ({ departmentId, departmentName }) => {
  const doctorIds = await getDepartmentDoctorIds({ departmentId, departmentName });
  if (!doctorIds.length) {
    return [];
  }

  const appointments = await Appointment.findAll({
    where: { D_ID: { [Op.in]: doctorIds } },
    attributes: ['P_ID'],
  });

  return [...new Set(appointments.map((row) => row.P_ID).filter((id) => Number.isInteger(id)))];
};

const getScopedNursePatientIds = async (nurseId) => {
  const [assignedIds, departmentContext] = await Promise.all([
    getAssignedPatientIds(nurseId),
    getNurseDepartmentContext(nurseId),
  ]);

  const departmentPatientIds = await getDepartmentPatientIds({
    departmentId: departmentContext.departmentId,
    departmentName: departmentContext.departmentName,
  });

  if (!departmentPatientIds.length) {
    return assignedIds;
  }

  if (!assignedIds.length) {
    return departmentPatientIds;
  }

  const departmentSet = new Set(departmentPatientIds);
  return assignedIds.filter((id) => departmentSet.has(id));
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
    const patientIds = await getScopedNursePatientIds(req.user.id);
    if (!patientIds.length) {
      return res.json(formatResponse(true, 'Department-scoped nurse patients fetched', []));
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

    return res.json(formatResponse(true, 'Department-scoped nurse patients fetched', payload));
  } catch (err) {
    return handleError(res, err);
  }
};

export const getNurseSchedule = async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const patientIds = await getScopedNursePatientIds(req.user.id);
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
    const uniqueDoctorIds = [...new Set(appointments.map((a) => a.D_ID).filter((id) => Number.isInteger(id)))];
    const [patients, doctors] = await Promise.all([
      User.findAll({
        where: { id: uniquePatientIds },
        attributes: ['id', 'name'],
      }),
      User.findAll({
        where: { id: uniqueDoctorIds },
        attributes: ['id', 'name'],
      }),
    ]);
    const patientMap = new Map(patients.map((p) => [p.id, p.name]));
    const doctorMap = new Map(doctors.map((d) => [d.id, d.name]));

    const payload = appointments.map((a) => ({
      id: a.id,
      date: a.date,
      time: a.time,
      status: a.status,
      patientId: a.P_ID,
      patientName: patientMap.get(a.P_ID) || `Patient #${a.P_ID}`,
      doctorId: a.D_ID,
      doctorName: doctorMap.get(a.D_ID) || (a.D_ID ? `Doctor #${a.D_ID}` : '-'),
    }));

    return res.json(formatResponse(true, 'Nurse schedule fetched', payload));
  } catch (err) {
    return handleError(res, err);
  }
};

export const getNurseOperationsContext = async (req, res) => {
  try {
    const { departmentId, departmentName } = await getNurseDepartmentContext(req.user.id);

    const doctorWhere = {};
    if (departmentId) {
      doctorWhere.Dept_ID = departmentId;
    } else if (departmentName) {
      doctorWhere.department = departmentName;
    }

    const doctors = await Doctor.findAll({
      where: doctorWhere,
      attributes: ['id', 'speciality', 'department', 'timeSchedule', 'availableTime', 'Dept_ID'],
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'phone'],
        },
        {
          model: Department,
          attributes: ['id', 'name', 'H_ID'],
          include: [
            {
              model: Hospital,
              attributes: ['id', 'name', 'location'],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const hospitalIds = [...new Set(
      doctors
        .map((doctor) => doctor.Department?.H_ID)
        .filter((id) => Number.isInteger(id))
    )];

    const staffContacts = await MedicalStaff.findAll({
      attributes: ['id', 'staffRole', 'sector', 'department', 'timeSchedule', 'SEC_ID'],
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'phone'],
        },
        {
          model: EmergencySector,
          attributes: ['id', 'name', 'H_ID'],
          include: [
            {
              model: Hospital,
              attributes: ['id', 'name', 'location'],
            },
          ],
          required: false,
        },
        {
          model: Department,
          attributes: ['id', 'name', 'H_ID'],
          include: [
            {
              model: Hospital,
              attributes: ['id', 'name', 'location'],
            },
          ],
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: 100,
    });

    const filteredHospitalStaff = staffContacts.filter((staff) => {
      const hasHospitalMetadata = Number.isInteger(staff.EmergencySector?.H_ID) || Number.isInteger(staff.Department?.H_ID);
      const inHospitalScope =
        !hospitalIds.length ||
        !hasHospitalMetadata ||
        hospitalIds.includes(staff.EmergencySector?.H_ID) ||
        hospitalIds.includes(staff.Department?.H_ID);

      return inHospitalScope;
    });

    const payload = {
      department: {
        id: departmentId,
        name: departmentName || null,
      },
      doctors: doctors.map((doctor) => ({
        id: doctor.id,
        name: doctor.User?.name || `Doctor #${doctor.id}`,
        email: doctor.User?.email || null,
        phone: doctor.User?.phone || null,
        speciality: doctor.speciality || null,
        department: doctor.Department?.name || doctor.department || null,
        availability: doctor.availableTime || doctor.timeSchedule || null,
        hospitalName: doctor.Department?.Hospital?.name || null,
      })),
      emergencyContacts: filteredHospitalStaff.map((staff) => ({
        id: staff.id,
        name: staff.User?.name || `Staff #${staff.id}`,
        role: staff.staffRole || 'MEDICAL STAFF',
        email: staff.User?.email || null,
        phone: staff.User?.phone || null,
        sector: staff.EmergencySector?.name || staff.sector || 'General',
        department: staff.Department?.name || staff.department || null,
        hospitalName: staff.EmergencySector?.Hospital?.name || staff.Department?.Hospital?.name || null,
      })),
    };

    return res.json(formatResponse(true, 'Nurse operations context fetched', payload));
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
    console.log('📝 updateMyNurseProfile called for user:', req.user?.id, 'with data:', Object.keys(req.body));
    
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
      if (req.body[f] !== undefined) {
        const raw = req.body[f];
        // DATEONLY columns reject empty string values in strict SQL mode.
        if ((f === 'dateOfBirth' || f === 'joiningDate') && String(raw || '').trim() === '') {
          nurseUpdates[f] = null;
        } else {
          nurseUpdates[f] = raw;
        }
      }
    }
    if (Object.prototype.hasOwnProperty.call(nurseUpdates, 'shift')) {
      nurseUpdates.timeSchedule = nurseUpdates.shift || null;
    }
    
    if (req.body.dateOfBirth !== undefined && String(req.body.dateOfBirth || '').trim() === '') {
      nurseUpdates.dateOfBirth = null;
    }

    console.log('📝 User updates:', Object.keys(userUpdates).length > 0 ? Object.keys(userUpdates) : 'none');
    console.log('📝 Nurse updates:', Object.keys(nurseUpdates).length > 0 ? Object.keys(nurseUpdates) : 'none');
    
    await Promise.all([
      Object.keys(userUpdates).length ? user.update(userUpdates) : Promise.resolve(),
      Object.keys(nurseUpdates).length ? nurse.update(nurseUpdates) : Promise.resolve(),
    ]);

    // Refresh from database to get latest values
    const updatedUser = await User.findByPk(user.id);
    const updatedNurse = await Nurse.findByPk(nurse.id);

    console.log('✅ Nurse profile updated successfully');
    return res.json(formatResponse(true, 'Nurse profile updated', {
      id:             updatedUser.id,
      name:           updatedUser.name,
      email:          updatedUser.email,
      phone:          updatedUser.phone,
      address:        updatedUser.address,
      gender:         updatedUser.gender,
      profileUrl:     updatedUser.profileUrl,
      dateOfBirth:    updatedNurse?.dateOfBirth    ?? '',
      employeeId:     updatedNurse?.employeeId     ?? '',
      department:     updatedNurse?.department     ?? '',
      shift:          updatedNurse?.shift          ?? updatedNurse?.timeSchedule ?? '',
      specialization: updatedNurse?.specialization ?? '',
      licenseNumber:  updatedNurse?.licenseNumber  ?? '',
      joiningDate:    updatedNurse?.joiningDate     ?? '',
      experience:     updatedNurse?.experience     ?? '',
      qualifications: updatedNurse?.qualifications ?? '',
      post:           updatedNurse?.post           ?? '',
    }));
  } catch (err) {
    console.error('❌ Error in updateMyNurseProfile:', err.message);
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
