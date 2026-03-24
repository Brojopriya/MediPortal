// src/controllers/doctorController.js
import { Op } from 'sequelize';
import { Appointment, Department, Doctor, Hospital, Telemedicine, User } from '../models/index.js';
import { formatResponse } from '../utils/responseFormatter.js';
import { handleError } from '../utils/errorHandler.js';

// Create a new doctor
export const createDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.create(req.body);
    res.status(201).json(formatResponse(true, 'Doctor added', doctor));
  } catch (err) {
    handleError(res, err);
  }
};

// Get all doctors
export const getAllDoctors = async (req, res) => {
  try {
    let doctorUsers = await User.findAll({
      where: { role: 'DOCTOR', approvalStatus: 'APPROVED' },
      attributes: ['id', 'name', 'profileUrl', 'professionalDetails'],
      order: [['createdAt', 'DESC']],
    });

    // Fallback: if no approved doctors exist yet, show doctor accounts so homepage isn't empty.
    if (!doctorUsers.length) {
      doctorUsers = await User.findAll({
        where: { role: 'DOCTOR' },
        attributes: ['id', 'name', 'profileUrl', 'professionalDetails'],
        order: [['createdAt', 'DESC']],
      });
    }

    const doctorIds = doctorUsers.map((u) => u.id);
    const doctorRows = doctorIds.length
      ? await Doctor.findAll({
          where: { id: { [Op.in]: doctorIds } },
          attributes: ['id', 'speciality', 'department', 'timeSchedule', 'Dept_ID', 'profileUrl'],
        })
      : [];

    const doctorMap = new Map(doctorRows.map((row) => [row.id, row]));

    const payload = doctorUsers.map((user) => {
      const d = user.toJSON();
      const doctor = doctorMap.get(d.id);
      let details = {};
      try {
        details = typeof d.professionalDetails === 'string'
          ? (d.professionalDetails ? JSON.parse(d.professionalDetails) : {})
          : (d.professionalDetails || {});
      } catch {
        details = {};
      }

      return {
        id: d.id,
        name: d.name || null,
        profileUrl: doctor?.profileUrl || d.profileUrl || null,
        speciality: doctor?.speciality || details.speciality || null,
        specialty: doctor?.speciality || details.speciality || null,
        department: doctor?.department || details.department || null,
        timeSchedule: doctor?.timeSchedule || details.timeSchedule || null,
        Dept_ID: doctor?.Dept_ID || details.deptId || null,
      };
    });

    res.json(formatResponse(true, 'All doctors fetched', payload));
  } catch (err) {
    handleError(res, err);
  }
};

// Get doctor by ID
export const getDoctorById = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { id: req.params.id, role: 'DOCTOR' },
      attributes: ['id', 'name', 'profileUrl', 'professionalDetails'],
    });
    if (!user) return res.status(404).json(formatResponse(false, 'Doctor not found'));

    const doctor = await Doctor.findByPk(user.id, {
      attributes: ['id', 'speciality', 'department', 'timeSchedule', 'Dept_ID', 'profileUrl'],
    });

    const d = user.toJSON();
    let details = {};
    try {
      details = typeof d.professionalDetails === 'string'
        ? (d.professionalDetails ? JSON.parse(d.professionalDetails) : {})
        : (d.professionalDetails || {});
    } catch {
      details = {};
    }

    res.json(formatResponse(true, 'Doctor fetched', {
      id: d.id,
      name: d.name || null,
      profileUrl: doctor?.profileUrl || d.profileUrl || null,
      speciality: doctor?.speciality || details.speciality || null,
      specialty: doctor?.speciality || details.speciality || null,
      department: doctor?.department || details.department || null,
      timeSchedule: doctor?.timeSchedule || details.timeSchedule || null,
      Dept_ID: doctor?.Dept_ID || details.deptId || null,
      qualification: details.qualification || null,
      experience: details.experience || null,
      consultationFee: details.consultationFee || null,
      availableDays: details.availableDays || null,
      availableTime: details.availableTime || null,
      bio: details.bio || null,
    }));
  } catch (err) {
    handleError(res, err);
  }
};

// Update doctor by ID
export const updateDoctor = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.Dept_ID !== undefined) {
      const rawDeptId = updates.Dept_ID;
      const deptId = rawDeptId === '' || rawDeptId === null ? null : Number(rawDeptId);
      if (Number.isInteger(deptId)) {
        const department = await Department.findByPk(deptId);
        updates.Dept_ID = department ? deptId : null;
      } else {
        updates.Dept_ID = null;
      }
    }

    const [updatedCount, updatedDoctors] = await Doctor.update(updates, {
      where: { id: req.params.id },
      returning: true, // returns updated record
    });
    if (updatedCount === 0) return res.status(404).json(formatResponse(false, 'Doctor not found'));
    res.json(formatResponse(true, 'Doctor updated', updatedDoctors[0]));
  } catch (err) {
    handleError(res, err);
  }
};

// Delete doctor by ID
export const deleteDoctor = async (req, res) => {
  try {
    const deleted = await Doctor.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json(formatResponse(false, 'Doctor not found'));
    res.json(formatResponse(true, 'Doctor deleted'));
  } catch (err) {
    handleError(res, err);
  }
};

// Get doctor profile for logged-in doctor.
export const getMyDoctorProfile = async (req, res) => {
  try {
    const [user, doctor] = await Promise.all([
      User.findByPk(req.user.id),
      Doctor.findByPk(req.user.id),
    ]);

    if (!user) {
      return res.status(404).json(formatResponse(false, 'User not found'));
    }

    const details = (() => {
      try {
        return user.professionalDetails ? JSON.parse(user.professionalDetails) : {};
      } catch {
        return {};
      }
    })();

    let selectedDepartment = null;
    if (doctor?.Dept_ID) {
      selectedDepartment = await Department.findByPk(doctor.Dept_ID, {
        attributes: ['id', 'name', 'H_ID'],
        include: [{ model: Hospital, attributes: ['id', 'name'] }],
      });
    }

    return res.json(
      formatResponse(true, 'Doctor profile fetched', {
        id: user.id,
        name: user.name,
        email: user.email,
        profileUrl: doctor?.profileUrl || user.profileUrl,
        phone: user.phone,
        address: user.address,
        gender: user.gender,
        speciality: doctor?.speciality || details.speciality || '',
        specialty: doctor?.speciality || details.speciality || '',
        department: selectedDepartment?.name || doctor?.department || details.department || '',
        timeSchedule: doctor?.timeSchedule || details.timeSchedule || '',
        deptId: doctor?.Dept_ID || details.deptId || '',
        hospitalId: selectedDepartment?.H_ID || '',
        hospitalName: selectedDepartment?.Hospital?.name || '',
        dateOfBirth: details.dateOfBirth || '',
        qualification: details.qualification || '',
        experience: details.experience || '',
        licenseNumber: details.licenseNumber || '',
        consultationFee: details.consultationFee || '',
        availableDays: details.availableDays || '',
        availableTime: details.availableTime || doctor?.timeSchedule || details.timeSchedule || '',
        bio: details.bio || '',
      })
    );
  } catch (err) {
    return handleError(res, err);
  }
};

// Update doctor profile for logged-in doctor.
export const updateMyDoctorProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json(formatResponse(false, 'User not found'));
    }

    const [doctor] = await Doctor.findOrCreate({
      where: { id: req.user.id },
      defaults: { id: req.user.id },
    });

    const userUpdates = {};
    const allowedUserFields = ['name', 'phone', 'address', 'gender', 'profileUrl'];
    for (const field of allowedUserFields) {
      if (req.body[field] !== undefined) {
        userUpdates[field] = req.body[field];
      }
    }

    if (req.body.email !== undefined) {
      const nextEmail = String(req.body.email || '').trim().toLowerCase();
      if (!nextEmail) {
        return res.status(400).json(formatResponse(false, 'Email cannot be empty'));
      }
      const existing = await User.findOne({ where: { email: nextEmail } });
      if (existing && existing.id !== user.id) {
        return res.status(400).json(formatResponse(false, 'Email already in use'));
      }
      userUpdates.email = nextEmail;
    }

    if (req.body.profileUrl !== undefined && !String(req.body.profileUrl || '').trim()) {
      return res.status(400).json(formatResponse(false, 'Profile photo URL is required for non-patient accounts'));
    }

    if (!user.profileUrl && !req.body.profileUrl) {
      return res.status(400).json(formatResponse(false, 'Profile photo URL is required for non-patient accounts'));
    }

    const speciality = String(req.body.speciality || req.body.specialty || '').trim();
    const departmentFromInput = String(req.body.department || '').trim();
    const timeSchedule = String(req.body.timeSchedule || req.body.availableTime || '').trim();
    const deptId = req.body.deptId === '' || req.body.deptId === undefined || req.body.deptId === null
      ? null
      : Number(req.body.deptId);
    let validDeptId = doctor.Dept_ID ?? null;
    let selectedDepartmentName = doctor.department || '';
    let selectedHospitalName = '';
    if (deptId === null) {
      validDeptId = null;
      selectedDepartmentName = departmentFromInput || doctor.department || '';
    } else if (Number.isInteger(deptId)) {
      const departmentRow = await Department.findByPk(deptId, {
        attributes: ['id', 'name', 'H_ID'],
        include: [{ model: Hospital, attributes: ['id', 'name'] }],
      });
      validDeptId = departmentRow ? deptId : null;
      selectedDepartmentName = departmentRow?.name || departmentFromInput || '';
      selectedHospitalName = departmentRow?.Hospital?.name || '';
    }

    await Promise.all([
      Object.keys(userUpdates).length > 0 ? user.update(userUpdates) : Promise.resolve(),
      doctor.update({
        speciality: speciality || doctor.speciality,
        department: selectedDepartmentName || doctor.department,
        timeSchedule: timeSchedule || doctor.timeSchedule,
        Dept_ID: validDeptId,
        profileUrl: userUpdates.profileUrl !== undefined ? userUpdates.profileUrl : doctor.profileUrl,
      }),
    ]);

    let existingDetails = {};
    try {
      existingDetails = user.professionalDetails ? JSON.parse(user.professionalDetails) : {};
    } catch {
      existingDetails = {};
    }

    const professionalDetails = {
      ...existingDetails,
      department: selectedDepartmentName || doctor.department || existingDetails.department || '',
      hospitalName: selectedHospitalName || existingDetails.hospitalName || '',
      timeSchedule: timeSchedule || doctor.timeSchedule || existingDetails.timeSchedule || '',
      speciality: speciality || doctor.speciality || existingDetails.speciality || '',
      deptId: validDeptId,
      dateOfBirth: req.body.dateOfBirth ?? existingDetails.dateOfBirth ?? '',
      qualification: req.body.qualification ?? existingDetails.qualification ?? '',
      experience: req.body.experience ?? existingDetails.experience ?? '',
      licenseNumber: req.body.licenseNumber ?? existingDetails.licenseNumber ?? '',
      consultationFee: req.body.consultationFee ?? existingDetails.consultationFee ?? '',
      availableDays: req.body.availableDays ?? existingDetails.availableDays ?? '',
      availableTime: req.body.availableTime ?? timeSchedule ?? existingDetails.availableTime ?? '',
      bio: req.body.bio ?? existingDetails.bio ?? '',
    };

    await user.update({ professionalDetails: JSON.stringify(professionalDetails) });

    return res.json(formatResponse(true, 'Doctor profile updated successfully', {
      ...professionalDetails,
      id: user.id,
      name: userUpdates.name ?? user.name,
      email: userUpdates.email ?? user.email,
      profileUrl: userUpdates.profileUrl ?? user.profileUrl,
      phone: userUpdates.phone ?? user.phone,
      address: userUpdates.address ?? user.address,
      gender: userUpdates.gender ?? user.gender,
      hospitalName: selectedHospitalName,
    }));
  } catch (err) {
    return handleError(res, err);
  }
};

// Doctor dashboard summary.
export const getDoctorDashboardSummary = async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const whereDoctor = { D_ID: req.user.id };

    const [todayAppointments, upcomingAppointments, completedAppointments, telemedicineCount, patientRows] = await Promise.all([
      Appointment.count({ where: { ...whereDoctor, date: today } }),
      Appointment.count({ where: { ...whereDoctor, date: { [Op.gte]: today } } }),
      Appointment.count({ where: { ...whereDoctor, status: 'COMPLETED' } }),
      Telemedicine.count({ where: { D_ID: req.user.id } }),
      Appointment.findAll({ where: whereDoctor, attributes: ['P_ID'], group: ['P_ID'] }),
    ]);

    const totalPatients = patientRows.filter((row) => row.P_ID !== null).length;

    return res.json(
      formatResponse(true, 'Doctor dashboard summary fetched', {
        todayAppointments,
        upcomingAppointments,
        completedAppointments,
        telemedicineCount,
        totalPatients,
      })
    );
  } catch (err) {
    return handleError(res, err);
  }
};

// Doctor's patient list derived from appointments.
export const getDoctorPatients = async (req, res) => {
  try {
    const patientRows = await Appointment.findAll({
      where: { D_ID: req.user.id, P_ID: { [Op.ne]: null } },
      attributes: ['P_ID', 'date'],
      order: [['date', 'DESC']],
    });

    const latestByPatient = new Map();
    for (const row of patientRows) {
      if (!latestByPatient.has(row.P_ID)) {
        latestByPatient.set(row.P_ID, row.date);
      }
    }

    const ids = [...latestByPatient.keys()];
    if (ids.length === 0) {
      return res.json(formatResponse(true, 'Doctor patients fetched', []));
    }

    const users = await User.findAll({
      where: { id: ids },
      attributes: ['id', 'name', 'phone', 'email', 'createdAt'],
    });

    const payload = users.map((u) => ({
      id: u.id,
      name: u.name,
      phone: u.phone,
      email: u.email,
      lastVisit: latestByPatient.get(u.id) || null,
    }));

    return res.json(formatResponse(true, 'Doctor patients fetched', payload));
  } catch (err) {
    return handleError(res, err);
  }
};
