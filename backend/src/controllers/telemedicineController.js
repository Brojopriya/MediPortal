// src/controllers/telemedicineController.js
import { Telemedicine } from '../models/index.js';
import { Doctor, Department, User } from '../models/index.js';
import { MedicalStaff } from '../models/index.js';
import { Op } from 'sequelize';
import { formatResponse } from '../utils/responseFormatter.js';
import { handleError } from '../utils/errorHandler.js';

const TELEMEDICINE_BKASH_NUMBER = '01978896352';

const roleOf = (req) => String(req.user?.role || '').toUpperCase();

export const submitRequest = async (req, res) => {
  try {
    const role = roleOf(req);
    if (role !== 'PATIENT') {
      return res.status(403).json(formatResponse(false, 'Only patients can submit telemedicine payment requests'));
    }

    const { D_ID, date, requestedTime, transactionId } = req.body;

    const doctorId = Number(D_ID);
    if (!Number.isInteger(doctorId) || doctorId <= 0) {
      return res.status(400).json(formatResponse(false, 'Valid doctor id is required'));
    }

    if (!date) {
      return res.status(400).json(formatResponse(false, 'Preferred date is required'));
    }

    if (!String(transactionId || '').trim()) {
      return res.status(400).json(formatResponse(false, 'Transaction ID is required'));
    }

    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) {
      return res.status(404).json(formatResponse(false, 'Doctor not found'));
    }

    const payload = {
      D_ID: doctorId,
      P_ID: req.user.id,
      date,
      requestedTime: String(requestedTime || '').trim() || null,
      paymentMethod: 'BKASH',
      paymentNumber: TELEMEDICINE_BKASH_NUMBER,
      transactionId: String(transactionId).trim(),
      requestStatus: 'PAYMENT_SUBMITTED',
      paymentStatus: 'PENDING',
      media: null,
      prescription: null,
    };

    const request = await Telemedicine.create(payload);
    res.status(201).json(formatResponse(true, 'Telemedicine request submitted. Waiting for staff verification.', request));
  } catch (err) {
    handleError(res, err);
  }
};

export const getReviewQueue = async (req, res) => {
  try {
    const role = roleOf(req);
    if (role !== 'STAFF') {
      return res.status(403).json(formatResponse(false, 'Only staff can access payment review queue'));
    }

    const staff = await MedicalStaff.findOne({ where: { U_ID: req.user.id } });
    if (!staff) {
      return res.status(404).json(formatResponse(false, 'Staff profile not found'));
    }

    const queue = await Telemedicine.findAll({
      where: {
        requestStatus: 'PAYMENT_SUBMITTED',
      },
      include: [
        {
          model: Doctor,
          attributes: ['id', 'department', 'Dept_ID'],
          include: [
            {
              model: User,
              attributes: ['id', 'name'],
            },
            {
              model: Department,
              attributes: ['id', 'name'],
            },
          ],
        },
        {
          model: User,
          as: 'PatientUser',
          attributes: ['id', 'name'],
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json(formatResponse(true, 'Telemedicine payment review queue fetched', queue));
  } catch (err) {
    handleError(res, err);
  }
};

export const reviewRequest = async (req, res) => {
  try {
    const role = roleOf(req);
    if (role !== 'STAFF') {
      return res.status(403).json(formatResponse(false, 'Only staff can review telemedicine requests'));
    }

    const requestId = Number(req.params.id);
    if (!Number.isInteger(requestId) || requestId <= 0) {
      return res.status(400).json(formatResponse(false, 'Valid request id is required'));
    }

    const action = String(req.body?.action || '').toUpperCase();
    if (!['APPROVE', 'REJECT'].includes(action)) {
      return res.status(400).json(formatResponse(false, 'action must be APPROVE or REJECT'));
    }

    const staff = await MedicalStaff.findOne({ where: { U_ID: req.user.id } });
    if (!staff) {
      return res.status(404).json(formatResponse(false, 'Staff profile not found'));
    }

    const request = await Telemedicine.findByPk(requestId);
    if (!request) {
      return res.status(404).json(formatResponse(false, 'Telemedicine request not found'));
    }

    if (String(request.requestStatus || '').toUpperCase() !== 'PAYMENT_SUBMITTED') {
      return res.status(400).json(formatResponse(false, 'This request is not in payment-submitted state'));
    }

    const approved = action === 'APPROVE';

    const updated = await request.update({
      S_ID: staff.id,
      requestStatus: approved ? 'STAFF_APPROVED' : 'STAFF_REJECTED',
      paymentStatus: approved ? 'VERIFIED' : 'REJECTED',
      staffReviewNote: String(req.body?.note || '').trim() || null,
    });

    res.json(
      formatResponse(
        true,
        approved
          ? 'Payment verified and request sent to doctor for scheduling'
          : 'Payment rejected by staff',
        updated
      )
    );
  } catch (err) {
    handleError(res, err);
  }
};

export const getAssignableStaff = async (req, res) => {
  try {
    const doctor = await Doctor.findByPk(req.user.id, {
      attributes: ['id', 'Dept_ID', 'department'],
    });

    if (!doctor) {
      return res.status(404).json(formatResponse(false, 'Doctor profile not found'));
    }

    const whereClause = {};

    if (doctor.Dept_ID) {
      whereClause.Dept_ID = doctor.Dept_ID;
    } else if (doctor.department) {
      whereClause.department = doctor.department;
    }

    const staffRows = await MedicalStaff.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'role'],
          where: { role: 'STAFF' },
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const payload = staffRows.map((staff) => ({
      id: staff.id,
      U_ID: staff.U_ID,
      name: staff.User?.name || null,
      department: staff.department || null,
      staffRole: staff.staffRole || null,
    }));

    res.json(formatResponse(true, 'Assignable staff fetched', payload));
  } catch (err) {
    handleError(res, err);
  }
};

// Get telemedicine sessions for the current user role
export const getSessions = async (req, res) => {
  try {
    const whereClause = {};
    const role = roleOf(req);

    if (role === 'DOCTOR') {
      whereClause.D_ID = req.user.id;
      whereClause.requestStatus = { [Op.in]: ['STAFF_APPROVED', 'DOCTOR_SCHEDULED'] };
    } else if (role === 'PATIENT') {
      whereClause.P_ID = req.user.id;
    } else if (role === 'STAFF') {
      const staff = await MedicalStaff.findOne({ where: { U_ID: req.user.id } });
      if (!staff) {
        return res.status(404).json(formatResponse(false, 'Staff profile not found'));
      }
      whereClause.S_ID = staff.id;
    }

    const sessions = await Telemedicine.findAll({
      where: whereClause,
      include: [
        {
          model: Doctor,
          attributes: ['id', 'department', 'Dept_ID'],
          include: [
            {
              model: User,
              attributes: ['id', 'name'],
            },
            {
              model: Department,
              attributes: ['id', 'name'],
            },
          ],
        },
        {
          model: MedicalStaff,
          attributes: ['id', 'U_ID', 'department', 'staffRole'],
          include: [
            {
              model: User,
              attributes: ['id', 'name'],
            },
          ],
        },
        {
          model: User,
          as: 'PatientUser',
          attributes: ['id', 'name'],
          required: false,
        },
      ],
      order: [['date', 'DESC'], ['createdAt', 'DESC']],
    });

    res.json(formatResponse(true, 'Telemedicine sessions fetched', sessions));
  } catch (err) {
    handleError(res, err);
  }
};

// Start a new telemedicine session
export const startSession = async (req, res) => {
  try {
    const role = roleOf(req);
    if (role !== 'DOCTOR') {
      return res.status(403).json(formatResponse(false, 'Only doctors can schedule online sessions'));
    }

    const requestId = Number(req.body?.requestId);
    if (!Number.isInteger(requestId) || requestId <= 0) {
      return res.status(400).json(formatResponse(false, 'requestId is required'));
    }

    const request = await Telemedicine.findByPk(requestId);
    if (!request) {
      return res.status(404).json(formatResponse(false, 'Telemedicine request not found'));
    }

    if (request.D_ID !== req.user.id) {
      return res.status(403).json(formatResponse(false, 'Forbidden: Request does not belong to this doctor'));
    }

    if (String(request.requestStatus || '').toUpperCase() !== 'STAFF_APPROVED') {
      return res.status(400).json(formatResponse(false, 'Staff approval is required before scheduling'));
    }

    const { date, media, prescription } = req.body;
    if (!date || !String(media || '').trim()) {
      return res.status(400).json(formatResponse(false, 'date and video link are required'));
    }

    const updated = await request.update({
      date,
      media: String(media).trim(),
      prescription: String(prescription || '').trim() || request.prescription,
      requestStatus: 'DOCTOR_SCHEDULED',
    });

    res.status(201).json(formatResponse(true, 'Online session scheduled successfully', updated));
  } catch (err) {
    handleError(res, err);
  }
};

// Get session by ID
export const getSessionById = async (req, res) => {
  try {
    const session = await Telemedicine.findByPk(req.params.id);
    if (!session) return res.status(404).json(formatResponse(false, 'Session not found'));
    res.json(formatResponse(true, 'Session details fetched', session));
  } catch (err) {
    handleError(res, err);
  }
};

// Update session by ID
export const updateSession = async (req, res) => {
  try {
    const [updatedCount, updatedSessions] = await Telemedicine.update(req.body, {
      where: { id: req.params.id },
      returning: true,
    });
    if (updatedCount === 0) return res.status(404).json(formatResponse(false, 'Session not found'));
    res.json(formatResponse(true, 'Session updated', updatedSessions[0]));
  } catch (err) {
    handleError(res, err);
  }
};

// End session by ID
export const endSession = async (req, res) => {
  try {
    const deleted = await Telemedicine.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json(formatResponse(false, 'Session not found'));
    res.json(formatResponse(true, 'Telemedicine session ended'));
  } catch (err) {
    handleError(res, err);
  }
};
