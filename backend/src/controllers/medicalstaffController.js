// src/controllers/medicalstaffController.js
import { MedicalStaff, User } from '../models/index.js';
import { formatResponse } from '../utils/responseFormatter.js';
import { handleError } from '../utils/errorHandler.js';

// Get logged-in staff member's full profile (User + MedicalStaff sub-table)
export const getMyStaffProfile = async (req, res) => {
  try {
    const [user, staff] = await Promise.all([
      User.findByPk(req.user.id),
      MedicalStaff.findOne({ where: { U_ID: req.user.id } }),
    ]);
    if (!user) return res.status(404).json(formatResponse(false, 'User not found'));

    return res.json(formatResponse(true, 'Staff profile fetched', {
      id:           user.id,
      name:         user.name,
      email:        user.email,
      phone:        user.phone,
      address:      user.address,
      gender:       user.gender,
      profileUrl:   user.profileUrl,
      dateOfBirth:  staff?.dateOfBirth  || '',
      employeeId:   staff?.employeeId   || '',
      role:         staff?.staffRole    || '',
      department:   staff?.department   || '',
      shift:        staff?.shift        || staff?.timeSchedule || '',
      joiningDate:  staff?.joiningDate  || '',
      experience:   staff?.experience   || '',
      qualification:staff?.qualification|| '',
      sector:       staff?.sector       || '',
    }));
  } catch (err) {
    return handleError(res, err);
  }
};

// Update logged-in staff member's profile
export const updateMyStaffProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json(formatResponse(false, 'User not found'));

    let staff = await MedicalStaff.findOne({ where: { U_ID: req.user.id } });
    if (!staff) {
      staff = await MedicalStaff.create({ U_ID: req.user.id });
    }

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

    const staffFields = ['dateOfBirth','employeeId','department','shift','joiningDate','experience','qualification','sector'];
    const staffUpdates = {};
    for (const f of staffFields) {
      if (req.body[f] !== undefined) staffUpdates[f] = req.body[f];
    }
    if (req.body.role !== undefined) staffUpdates.staffRole = req.body.role;
    if (staffUpdates.shift) staffUpdates.timeSchedule = staffUpdates.shift;

    await Promise.all([
      Object.keys(userUpdates).length ? user.update(userUpdates) : Promise.resolve(),
      Object.keys(staffUpdates).length ? staff.update(staffUpdates) : Promise.resolve(),
    ]);

    return res.json(formatResponse(true, 'Staff profile updated', {
      id:           user.id,
      name:         userUpdates.name        ?? user.name,
      email:        userUpdates.email       ?? user.email,
      phone:        userUpdates.phone       ?? user.phone,
      address:      userUpdates.address     ?? user.address,
      gender:       userUpdates.gender      ?? user.gender,
      profileUrl:   userUpdates.profileUrl  ?? user.profileUrl,
      dateOfBirth:  staffUpdates.dateOfBirth  ?? staff.dateOfBirth  ?? '',
      employeeId:   staffUpdates.employeeId   ?? staff.employeeId   ?? '',
      role:         staffUpdates.staffRole    ?? staff.staffRole    ?? '',
      department:   staffUpdates.department   ?? staff.department   ?? '',
      shift:        staffUpdates.shift        ?? staff.shift        ?? '',
      joiningDate:  staffUpdates.joiningDate  ?? staff.joiningDate  ?? '',
      experience:   staffUpdates.experience   ?? staff.experience   ?? '',
      qualification:staffUpdates.qualification?? staff.qualification?? '',
      sector:       staffUpdates.sector       ?? staff.sector       ?? '',
    }));
  } catch (err) {
    return handleError(res, err);
  }
};
