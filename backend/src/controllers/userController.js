// src/controllers/userController.js
import { Department, Doctor, EmergencySector, MedicalStaff, Nurse, Patient, User, Ward, sequelize } from '../models/index.js';
import { formatResponse } from '../utils/responseFormatter.js';
import { handleError } from '../utils/errorHandler.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Op, fn, col, where as sequelizeWhere } from 'sequelize';

const FALLBACK_JWT_SECRET = 'mediportal-temporary-jwt-secret-change-me';
let didWarnMissingJwtSecret = false;

const getJwtSecret = () => {
  const secret = String(process.env.JWT_SECRET || '').trim();
  if (!secret) {
    if (!didWarnMissingJwtSecret) {
      console.warn('⚠️ JWT_SECRET is missing. Using temporary fallback secret. Set JWT_SECRET in production env.');
      didWarnMissingJwtSecret = true;
    }
    return FALLBACK_JWT_SECRET;
  }
  return secret;
};

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
    profileUrl: details.profileUrl ? String(details.profileUrl).trim() : undefined,
    speciality: details.speciality ? String(details.speciality).trim() : undefined,
    post: details.post ? String(details.post).trim() : undefined,
    sector: details.sector ? String(details.sector).trim() : undefined,
    deptId: toIntOrNull(details.deptId),
    wardId: toIntOrNull(details.wardId),
    emergencySectorId: toIntOrNull(details.emergencySectorId),
  };
};

const upsertProfessionalProfile = async (role, userId, details, profileUrl, transaction) => {
  if (role === 'PATIENT') {
    // Ensure a Patient row always exists for every patient user
    await Patient.upsert({ id: userId }, { transaction });
    return;
  }

  if (!NEEDS_ADMIN_APPROVAL.has(role) || !details) {
    return;
  }

  const resolveDepartmentId = async (deptId) => {
    if (!Number.isInteger(deptId)) return null;
    const row = await Department.findByPk(deptId, { transaction });
    return row ? deptId : null;
  };

  const resolveWardId = async (wardId) => {
    if (!Number.isInteger(wardId)) return null;
    const row = await Ward.findByPk(wardId, { transaction });
    return row ? wardId : null;
  };

  const resolveEmergencySectorId = async (secId) => {
    if (!Number.isInteger(secId)) return null;
    const row = await EmergencySector.findByPk(secId, { transaction });
    return row ? secId : null;
  };

  if (role === 'DOCTOR') {
    const deptId = await resolveDepartmentId(details.deptId);
    await Doctor.upsert({
      id: userId,
      speciality:      details.speciality,
      department:      details.department,
      timeSchedule:    details.timeSchedule,
      Dept_ID:         deptId,
      licenseNumber:   details.licenseNumber   || null,
      experience:      details.experience      || null,
      consultationFee: details.consultationFee || null,
      availableDays:   details.availableDays   || null,
      availableTime:   details.availableTime   || details.timeSchedule || null,
      bio:             details.bio             || null,
      qualification:   details.qualification   || null,
      profileUrl:      profileUrl ? String(profileUrl).trim() : null,
    }, { transaction });
    return;
  }

  if (role === 'NURSE') {
    const wardId = await resolveWardId(details.wardId);
    await Nurse.upsert({
      id:          userId,
      post:        details.post,
      department:  details.department,
      timeSchedule:details.timeSchedule,
      W_ID:        wardId,
    }, { transaction });
    return;
  }

  if (role === 'STAFF') {
    const deptId = await resolveDepartmentId(details.deptId);
    const emergencySectorId = await resolveEmergencySectorId(details.emergencySectorId);
    await MedicalStaff.upsert({
      U_ID:        userId,
      sector:      details.sector,
      department:  details.department,
      timeSchedule:details.timeSchedule,
      Dept_ID:     deptId,
      SEC_ID:      emergencySectorId,
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

const validateProfilePhotoByRole = (role, profileUrl) => {
  if (role === 'PATIENT') {
    return { valid: true };
  }

  if (!profileUrl || !String(profileUrl).trim()) {
    return { valid: false, message: 'Profile photo URL is required for doctor, nurse, and staff accounts' };
  }

  return { valid: true };
};

// Register User
export const registerUser = async (req, res) => {
  console.log("REGISTER BODY:", req.body);
  try {
    let { name, email, password, role, phone, professionalDetails, profileUrl } = req.body;
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

    const photoValidation = validateProfilePhotoByRole(normalizedRole, profileUrl);
    if (!photoValidation.valid) {
      return res.status(400).json(formatResponse(false, photoValidation.message));
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
        profileUrl: profileUrl ? String(profileUrl).trim() : null,
      }, { transaction });

      await upsertProfessionalProfile(normalizedRole, createdUser.id, cleanProfessionalDetails, profileUrl, transaction);
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

    const jwtSecret = getJwtSecret();
    const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: '7d' });
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
    const rawName = String(req.body?.name || '').trim();
    const normalizedEmail = rawName.includes('@') ? rawName.toLowerCase() : '';
    const normalizedName = rawName;
    const { password } = req.body;

    if (!rawName || !password) {
      return res.status(400).json(formatResponse(false, 'Admin name/email and password are required'));
    }

    const admin = await User.findOne({
      where: {
        role: 'ADMIN',
        [Op.or]: normalizedEmail
          ? [{ email: normalizedEmail }]
          : [sequelizeWhere(fn('LOWER', col('U_Name')), normalizedName.toLowerCase())],
      },
    });

    if (!admin) {
      return res.status(404).json(formatResponse(false, 'Admin user not found'));
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json(formatResponse(false, 'Invalid credentials'));
    }

    const jwtSecret = getJwtSecret();
    const token = jwt.sign({ id: admin.id }, jwtSecret, { expiresIn: '7d' });
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
    const finalApprovalStatus = updates.approvalStatus || user.approvalStatus;
    const finalProfileUrl = updates.profileUrl !== undefined ? updates.profileUrl : user.profileUrl;

    let cleanProfessionalDetails = null;

    if (NEEDS_ADMIN_APPROVAL.has(finalRole)) {
      const incoming = req.body.professionalDetails ?? parseProfessionalDetails(user.professionalDetails);
      const parsedIncoming = parseProfessionalDetails(incoming);

      if (finalApprovalStatus === 'APPROVED') {
        const validation = validateProfessionalDetails(finalRole, parsedIncoming);
        if (!validation.valid) {
          return res.status(400).json(
            formatResponse(false, 'Professional details are required before approving this account')
          );
        }

        const photoValidation = validateProfilePhotoByRole(finalRole, finalProfileUrl);
        if (!photoValidation.valid) {
          return res.status(400).json(
            formatResponse(false, 'Profile photo URL is required before approving this account')
          );
        }
      }

      cleanProfessionalDetails = normalizeProfessionalDetails(finalRole, parsedIncoming);
      updates.professionalDetails = cleanProfessionalDetails ? JSON.stringify(cleanProfessionalDetails) : null;
    } else {
      updates.professionalDetails = null;
    }

    await sequelize.transaction(async (transaction) => {
      await user.update(updates, { transaction });
      await upsertProfessionalProfile(finalRole, user.id, cleanProfessionalDetails, finalProfileUrl, transaction);
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
    let { name, email, password, role, phone, approvalStatus, professionalDetails, profileUrl } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json(formatResponse(false, 'Name, email and password are required'));
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedRole = String(role || 'PATIENT').toUpperCase();

    if (!ALLOWED_ROLES.has(normalizedRole)) {
      return res.status(400).json(formatResponse(false, 'Invalid role value'));
    }

    const parsedProfessionalDetails = parseProfessionalDetails(professionalDetails);

    const existing = await User.findOne({ where: { email: normalizedEmail } });
    if (existing) {
      return res.status(400).json(formatResponse(false, 'User already exists'));
    }

    let normalizedApproval = String(approvalStatus || '').toUpperCase();
    if (!normalizedApproval) {
      normalizedApproval = NEEDS_ADMIN_APPROVAL.has(normalizedRole) ? 'PENDING' : 'APPROVED';
    }

    if (!ALLOWED_APPROVALS.has(normalizedApproval)) {
      return res.status(400).json(formatResponse(false, 'Invalid approvalStatus value'));
    }

    let cleanProfessionalDetails = null;
    let finalApprovalStatus = normalizedApproval;

    if (NEEDS_ADMIN_APPROVAL.has(normalizedRole)) {
      const hasProfileUrl = Boolean(profileUrl && String(profileUrl).trim());
      const hasProfessionalDetails = Boolean(parsedProfessionalDetails);

      if (hasProfessionalDetails) {
        const validation = validateProfessionalDetails(normalizedRole, parsedProfessionalDetails);
        if (!validation.valid) {
          return res.status(400).json(formatResponse(false, validation.message));
        }
      }

      cleanProfessionalDetails = normalizeProfessionalDetails(normalizedRole, parsedProfessionalDetails);

      if (finalApprovalStatus === 'APPROVED' && (!hasProfileUrl || !cleanProfessionalDetails)) {
        // Keep incomplete professional accounts pending until profile details are completed.
        finalApprovalStatus = 'PENDING';
      }
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await sequelize.transaction(async (transaction) => {
      const createdUser = await User.create({
        name,
        email: normalizedEmail,
        password: hashed,
        role: normalizedRole,
        phone,
        profileUrl: profileUrl ? String(profileUrl).trim() : null,
        approvalStatus: finalApprovalStatus,
        professionalDetails: cleanProfessionalDetails ? JSON.stringify(cleanProfessionalDetails) : null,
      }, { transaction });

      await upsertProfessionalProfile(normalizedRole, createdUser.id, cleanProfessionalDetails, profileUrl, transaction);
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

// Forgot password endpoint.
// Current behavior supports two flows:
// 1) email only -> acknowledge reset request (placeholder for email-link integration)
// 2) email + newPassword -> directly update password
export const forgotPassword = async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const newPassword = String(req.body?.newPassword || '').trim();

    if (!email) {
      return res.status(400).json(formatResponse(false, 'Email is required'));
    }

    const user = await User.findOne({ where: { email } });

    // Avoid user-enumeration by returning same success response when account is missing.
    if (!user) {
      return res.json(formatResponse(true, 'If the account exists, password reset instructions have been sent'));
    }

    if (!newPassword) {
      return res.json(formatResponse(true, 'Password reset link sent (check your email).'));
    }

    if (newPassword.length < 6) {
      return res.status(400).json(formatResponse(false, 'New password must be at least 6 characters long'));
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashed });

    return res.json(formatResponse(true, 'Password reset successful'));
  } catch (err) {
    return handleError(res, err);
  }
};
