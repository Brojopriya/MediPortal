// src/controllers/userController.js
import { Doctor, MedicalStaff, Nurse, User, sequelize } from '../models/index.js';
import { formatResponse } from '../utils/responseFormatter.js';
import { handleError } from '../utils/errorHandler.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const NEEDS_ADMIN_APPROVAL = new Set(['DOCTOR', 'NURSE', 'STAFF']);
const ALLOWED_ROLES = new Set(['ADMIN', 'DOCTOR', 'NURSE', 'STAFF', 'PATIENT']);
const ALLOWED_APPROVALS = new Set(['PENDING', 'APPROVED', 'REJECTED']);

const toIntOrNull = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
};

const parseProfessionalDetails = (raw) => {
  if (!raw) {
    return null;
  }

  if (typeof raw === 'object') {
    return raw;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const normalizeProfessionalDetails = (role, details) => {
  if (!NEEDS_ADMIN_APPROVAL.has(role) || !details) {
    return null;
  }

  return {
    department: String(details.department || '').trim(),
    timeSchedule: String(details.timeSchedule || '').trim(),
    speciality: details.speciality ? String(details.speciality).trim() : undefined,
    post: details.post ? String(details.post).trim() : undefined,
    sector: details.sector ? String(details.sector).trim() : undefined,
    deptId: toIntOrNull(details.deptId),
    wardId: toIntOrNull(details.wardId),
    emergencySectorId: toIntOrNull(details.emergencySectorId),
  };
};

const upsertProfessionalProfile = async (role, userId, details, transaction) => {
  if (!NEEDS_ADMIN_APPROVAL.has(role) || !details) {
    return;
  }

  if (role === 'DOCTOR') {
    await Doctor.upsert({
      id: userId,
      speciality: details.speciality,
      department: details.department,
      timeSchedule: details.timeSchedule,
      Dept_ID: details.deptId,
    }, { transaction });
    return;
  }

  if (role === 'NURSE') {
    await Nurse.upsert({
      id: userId,
      post: details.post,
      department: details.department,
      timeSchedule: details.timeSchedule,
      W_ID: details.wardId,
    }, { transaction });
    return;
  }

  if (role === 'STAFF') {
    await MedicalStaff.upsert({
      U_ID: userId,
      sector: details.sector,
      department: details.department,
      timeSchedule: details.timeSchedule,
      Dept_ID: details.deptId,
      SEC_ID: details.emergencySectorId,
    }, { transaction });
  }
};

const validateProfessionalDetails = (role, details) => {
  if (!NEEDS_ADMIN_APPROVAL.has(role)) {
    return { valid: true };
  }

  if (!details || typeof details !== 'object') {
    return { valid: false, message: 'Professional details are required for this role' };
  }

  if (!details.department || !details.timeSchedule) {
    return { valid: false, message: 'Department and time schedule are required' };
  }

  if (role === 'DOCTOR' && !details.speciality) {
    return { valid: false, message: 'Speciality is required for doctor signup' };
  }

  if (role === 'NURSE' && !details.post) {
    return { valid: false, message: 'Post is required for nurse signup' };
  }

  if (role === 'STAFF' && !details.sector) {
    return { valid: false, message: 'Sector is required for staff signup' };
  }

  return { valid: true };
};

// Register User
export const registerUser = async (req, res) => {
  console.log("REGISTER BODY:", req.body);
  try {
    let { name, email, password, role, phone, professionalDetails } = req.body;
    email = email?.trim().toLowerCase();

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json(
        formatResponse(false, "Name, email and password are required")
      );
    }

    // Check if user already exists
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json(
        formatResponse(false, "User already exists")
      );
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create user
    const normalizedRole = (role || 'PATIENT').toUpperCase();
    const approvalStatus = NEEDS_ADMIN_APPROVAL.has(normalizedRole) ? 'PENDING' : 'APPROVED';

    const validation = validateProfessionalDetails(normalizedRole, professionalDetails);
    if (!validation.valid) {
      return res.status(400).json(formatResponse(false, validation.message));
    }

    const cleanProfessionalDetails = normalizeProfessionalDetails(normalizedRole, professionalDetails);

    const user = await sequelize.transaction(async (transaction) => {
      const createdUser = await User.create({
        name,
        email,
        phone,
        password: hashed,
        role: normalizedRole,
        approvalStatus,
        professionalDetails: cleanProfessionalDetails ? JSON.stringify(cleanProfessionalDetails) : null,
      }, { transaction });

      await upsertProfessionalProfile(normalizedRole, createdUser.id, cleanProfessionalDetails, transaction);
      return createdUser;
    });

    res.status(201).json(
      formatResponse(true, "User registered successfully", {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        approvalStatus: user.approvalStatus,
        professionalDetails: cleanProfessionalDetails,
      })
    );
  } catch (err) {
    console.error("REGISTER ERROR:", err);   // 👈 Important for debugging
    handleError(res, err);
  }
};


// Login User
export const loginUser = async (req, res) => {
  try {
    console.log("LOGIN REQ:", req.body);
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) {
      console.warn(`LOGIN - user not found: ${normalizedEmail}`);
      return res.status(404).json(formatResponse(false, 'User not found'));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn(`LOGIN - password mismatch for user id=${user.id} email=${user.email}`);
      return res.status(401).json(formatResponse(false, 'Invalid credentials'));
    }

    if (NEEDS_ADMIN_APPROVAL.has(user.role) && user.approvalStatus !== 'APPROVED') {
      const statusText = user.approvalStatus === 'REJECTED' ? 'rejected' : 'pending';
      return res.status(403).json(
        formatResponse(false, `Your ${user.role.toLowerCase()} account is ${statusText} admin approval.`)
      );
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const parsedProfessionalDetails = parseProfessionalDetails(user.professionalDetails);

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      approvalStatus: user.approvalStatus,
      phone: user.phone,
      address: user.address,
      gender: user.gender,
      profileUrl: user.profileUrl,
      professionalDetails: parsedProfessionalDetails,
    };
    res.json(formatResponse(true, 'Login successful', { token, user: safeUser }));
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    handleError(res, err);
  }
};

// Get User Profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json(formatResponse(false, 'User not found'));
    const payload = {
      ...user.toJSON(),
      professionalDetails: parseProfessionalDetails(user.professionalDetails),
    };
    res.json(formatResponse(true, 'User profile fetched', payload));
  } catch (err) {
    handleError(res, err);
  }
};

// Update User Profile
export const updateUserProfile = async (req, res) => {
  try {
    const [updatedCount, updatedUsers] = await User.update(req.body, {
      where: { id: req.user.id },
      returning: true,
    });
    if (updatedCount === 0) return res.status(404).json(formatResponse(false, 'User not found'));
    res.json(formatResponse(true, 'User profile updated', updatedUsers[0]));
  } catch (err) {
    handleError(res, err);
  }
};

// Delete User
export const deleteUser = async (req, res) => {
  try {
    const deleted = await User.destroy({ where: { id: req.user.id } });
    if (!deleted) return res.status(404).json(formatResponse(false, 'User not found'));
    res.json(formatResponse(true, 'User deleted successfully'));
  } catch (err) {
    handleError(res, err);
  }
};

// Admin login by admin name + password (no email required)
export const adminLoginUser = async (req, res) => {
  try {
    const { name, password } = req.body;
    if (!name || !password) {
      return res.status(400).json(formatResponse(false, 'Name and password are required'));
    }

    const admin = await User.findOne({ where: { name, role: 'ADMIN' } });
    if (!admin) {
      return res.status(404).json(formatResponse(false, 'Admin user not found'));
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json(formatResponse(false, 'Invalid credentials'));
    }

    const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const safeUser = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      approvalStatus: admin.approvalStatus,
    };

    return res.json(formatResponse(true, 'Admin login successful', { token, user: safeUser }));
  } catch (err) {
    return handleError(res, err);
  }
};

// Admin: list all pending professional account approvals
export const getPendingApprovals = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { approvalStatus: 'PENDING' },
      attributes: ['id', 'name', 'email', 'role', 'phone', 'approvalStatus', 'professionalDetails', 'createdAt'],
      order: [['createdAt', 'ASC']],
    });

    const mapped = users.map((user) => ({
      ...user.toJSON(),
      professionalDetails: parseProfessionalDetails(user.professionalDetails),
    }));

    res.json(formatResponse(true, 'Pending approvals fetched', mapped));
  } catch (err) {
    handleError(res, err);
  }
};

// Admin: approve or reject a user account.
export const updateUserApprovalStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const normalized = (status || '').toUpperCase();
    if (!['APPROVED', 'REJECTED'].includes(normalized)) {
      return res.status(400).json(formatResponse(false, 'Status must be APPROVED or REJECTED'));
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json(formatResponse(false, 'User not found'));
    }

    user.approvalStatus = normalized;
    await user.save();

    return res.json(
      formatResponse(true, 'User approval status updated', {
        id: user.id,
        name: user.name,
        role: user.role,
        approvalStatus: user.approvalStatus,
      })
    );
  } catch (err) {
    handleError(res, err);
  }
};

// Admin: list all user accounts
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'phone', 'approvalStatus', 'professionalDetails', 'createdAt', 'updatedAt'],
      order: [['createdAt', 'DESC']],
    });

    const mapped = users.map((user) => ({
      ...user.toJSON(),
      professionalDetails: parseProfessionalDetails(user.professionalDetails),
    }));

    return res.json(formatResponse(true, 'Users fetched successfully', mapped));
  } catch (err) {
    return handleError(res, err);
  }
};

// Admin: update any user account details
export const adminUpdateUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json(formatResponse(false, 'User not found'));
    }

    if (user.id === req.user.id && req.body.role && req.body.role.toUpperCase() !== 'ADMIN') {
      return res.status(400).json(formatResponse(false, 'Admin cannot remove own ADMIN role'));
    }

    const updates = {};
    const allowedFields = ['name', 'email', 'phone', 'address', 'gender', 'profileUrl'];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (req.body.email) {
      updates.email = String(req.body.email).trim().toLowerCase();
      const existing = await User.findOne({ where: { email: updates.email } });
      if (existing && existing.id !== user.id) {
        return res.status(400).json(formatResponse(false, 'Email already in use'));
      }
    }

    if (req.body.role) {
      const normalizedRole = String(req.body.role).toUpperCase();
      if (!ALLOWED_ROLES.has(normalizedRole)) {
        return res.status(400).json(formatResponse(false, 'Invalid role value'));
      }
      updates.role = normalizedRole;
    }

    if (req.body.approvalStatus) {
      const normalizedStatus = String(req.body.approvalStatus).toUpperCase();
      if (!ALLOWED_APPROVALS.has(normalizedStatus)) {
        return res.status(400).json(formatResponse(false, 'Invalid approvalStatus value'));
      }
      updates.approvalStatus = normalizedStatus;
    }

    if (req.body.password) {
      updates.password = await bcrypt.hash(req.body.password, 10);
    }

    const finalRole = updates.role || user.role;
    let cleanProfessionalDetails = null;

    if (NEEDS_ADMIN_APPROVAL.has(finalRole)) {
      const incoming = req.body.professionalDetails ?? parseProfessionalDetails(user.professionalDetails);
      const validation = validateProfessionalDetails(finalRole, incoming);
      if (!validation.valid) {
        return res.status(400).json(formatResponse(false, validation.message));
      }

      cleanProfessionalDetails = normalizeProfessionalDetails(finalRole, incoming);
      updates.professionalDetails = JSON.stringify(cleanProfessionalDetails);
    } else {
      updates.professionalDetails = null;
    }

    await sequelize.transaction(async (transaction) => {
      await user.update(updates, { transaction });
      await upsertProfessionalProfile(finalRole, user.id, cleanProfessionalDetails, transaction);
    });

    return res.json(
      formatResponse(true, 'User updated successfully', {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        approvalStatus: user.approvalStatus,
        professionalDetails: parseProfessionalDetails(user.professionalDetails),
      })
    );
  } catch (err) {
    return handleError(res, err);
  }
};

// Admin: delete any user account
export const adminDeleteUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json(formatResponse(false, 'User not found'));
    }

    if (user.id === req.user.id) {
      return res.status(400).json(formatResponse(false, 'Admin cannot delete own account'));
    }

    await user.destroy();
    return res.json(formatResponse(true, 'User deleted successfully'));
  } catch (err) {
    return handleError(res, err);
  }
};

// Admin: summary metrics for dashboard cards
export const getAdminSummary = async (req, res) => {
  try {
    const [
      totalUsers,
      pendingApprovals,
      approvedUsers,
      rejectedUsers,
      doctors,
      nurses,
      staff,
      patients,
      admins,
    ] = await Promise.all([
      User.count(),
      User.count({ where: { approvalStatus: 'PENDING' } }),
      User.count({ where: { approvalStatus: 'APPROVED' } }),
      User.count({ where: { approvalStatus: 'REJECTED' } }),
      User.count({ where: { role: 'DOCTOR' } }),
      User.count({ where: { role: 'NURSE' } }),
      User.count({ where: { role: 'STAFF' } }),
      User.count({ where: { role: 'PATIENT' } }),
      User.count({ where: { role: 'ADMIN' } }),
    ]);

    return res.json(
      formatResponse(true, 'Admin summary fetched', {
        totalUsers,
        pendingApprovals,
        approvedUsers,
        rejectedUsers,
        byRole: {
          doctors,
          nurses,
          staff,
          patients,
          admins,
        },
      })
    );
  } catch (err) {
    return handleError(res, err);
  }
};

// Admin: create user account directly from dashboard
export const adminCreateUser = async (req, res) => {
  try {
    let { name, email, password, role, phone, approvalStatus, professionalDetails } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json(formatResponse(false, 'Name, email and password are required'));
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedRole = String(role || 'PATIENT').toUpperCase();

    if (!ALLOWED_ROLES.has(normalizedRole)) {
      return res.status(400).json(formatResponse(false, 'Invalid role value'));
    }

    const validation = validateProfessionalDetails(normalizedRole, professionalDetails);
    if (!validation.valid) {
      return res.status(400).json(formatResponse(false, validation.message));
    }

    const existing = await User.findOne({ where: { email: normalizedEmail } });
    if (existing) {
      return res.status(400).json(formatResponse(false, 'User already exists'));
    }

    let normalizedApproval = String(approvalStatus || '').toUpperCase();
    if (!normalizedApproval) {
      normalizedApproval = NEEDS_ADMIN_APPROVAL.has(normalizedRole) ? 'APPROVED' : 'APPROVED';
    }

    if (!ALLOWED_APPROVALS.has(normalizedApproval)) {
      return res.status(400).json(formatResponse(false, 'Invalid approvalStatus value'));
    }

    const cleanProfessionalDetails = normalizeProfessionalDetails(normalizedRole, professionalDetails);
    const hashed = await bcrypt.hash(password, 10);
    const user = await sequelize.transaction(async (transaction) => {
      const createdUser = await User.create({
        name,
        email: normalizedEmail,
        password: hashed,
        role: normalizedRole,
        phone,
        approvalStatus: normalizedApproval,
        professionalDetails: cleanProfessionalDetails ? JSON.stringify(cleanProfessionalDetails) : null,
      }, { transaction });

      await upsertProfessionalProfile(normalizedRole, createdUser.id, cleanProfessionalDetails, transaction);
      return createdUser;
    });

    return res.status(201).json(
      formatResponse(true, 'User created successfully', {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        approvalStatus: user.approvalStatus,
        professionalDetails: cleanProfessionalDetails,
      })
    );
  } catch (err) {
    return handleError(res, err);
  }
};
