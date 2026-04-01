// src/controllers/telemedicineController.js
import { Telemedicine } from '../models/index.js';
import { Doctor, Department, User } from '../models/index.js';
import { MedicalStaff, Nurse, NursePatient } from '../models/index.js';
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

    let doctor = null;
    try {
      doctor = await Doctor.findByPk(doctorId);
    } catch (err) {
      console.error('Error finding doctor:', err.message);
      doctor = null;
    }

    // Legacy data can contain DOCTOR users without a Doctor profile row.
    // Auto-create a minimal profile so patients can still submit requests.
    if (!doctor) {
      const doctorUser = await User.findByPk(doctorId, {
        attributes: ['id', 'role', 'approvalStatus', 'professionalDetails'],
      });

      if (!doctorUser || String(doctorUser.role || '').toUpperCase() !== 'DOCTOR') {
        return res.status(404).json(formatResponse(false, 'Doctor not found'));
      }

      if (String(doctorUser.approvalStatus || '').toUpperCase() !== 'APPROVED') {
        return res.status(400).json(formatResponse(false, 'Selected doctor is not approved for telemedicine yet'));
      }

      let details = {};
      try {
        details = doctorUser.professionalDetails
          ? JSON.parse(doctorUser.professionalDetails)
          : {};
      } catch {
        details = {};
      }

      [doctor] = await Doctor.findOrCreate({
        where: { id: doctorId },
        defaults: {
          id: doctorId,
          department: String(details.department || '').trim() || null,
          speciality: String(details.speciality || '').trim() || null,
          timeSchedule: String(details.timeSchedule || '').trim() || null,
          Dept_ID: Number.isInteger(Number(details.deptId)) ? Number(details.deptId) : null,
        },
      });
    }

    if (!doctor || !doctor.id) {
      return res.status(404).json(formatResponse(false, 'Doctor profile unavailable'));
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

    // Support legacy Telemedicine schemas that may miss newer columns.
    const payloadCandidates = [
      payload,
      {
        D_ID: doctorId,
        P_ID: req.user.id,
        date,
        paymentMethod: 'BKASH',
        paymentNumber: TELEMEDICINE_BKASH_NUMBER,
        transactionId: String(transactionId).trim(),
      },
      {
        D_ID: doctorId,
        P_ID: req.user.id,
        date,
        transactionId: String(transactionId).trim(),
      },
    ];

    let request = null;
    let lastErr = null;

    for (const candidate of payloadCandidates) {
      try {
        request = await Telemedicine.create(candidate);
        lastErr = null;
        break;
      } catch (createErr) {
        const code = createErr?.parent?.code || createErr?.original?.code || createErr?.code;
        if (code === 'ER_BAD_FIELD_ERROR' || code === 'ER_NO_SUCH_TABLE') {
          lastErr = createErr;
          continue;
        }
        throw createErr;
      }
    }

    if (!request) {
      if (lastErr) {
        return res.status(500).json(
          formatResponse(false, 'Telemedicine table schema is out of sync. Please restart backend to apply model changes.')
        );
      }
      return res.status(500).json(formatResponse(false, 'Unable to submit telemedicine request'));
    }

    res.status(201).json(formatResponse(true, 'Telemedicine request submitted. Waiting for staff verification.', request));
  } catch (err) {
    console.error('Error in submitRequest:', err.message);
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
    } else if (role === 'PATIENT') {
      whereClause.P_ID = req.user.id;
    } else if (role === 'STAFF') {
      const staff = await MedicalStaff.findOne({ where: { U_ID: req.user.id } });
      if (!staff) {
        return res.status(404).json(formatResponse(false, 'Staff profile not found'));
      }
      whereClause.S_ID = staff.id;
    } else if (role === 'NURSE') {
      const nurse = await Nurse.findByPk(req.user.id, { attributes: ['id'] });
      if (!nurse) {
        return res.status(404).json(formatResponse(false, 'Nurse profile not found'));
      }

      const assignments = await NursePatient.findAll({
        where: { N_ID: nurse.id },
        attributes: ['P_ID'],
      });

      const assignedPatientIds = assignments
        .map((row) => Number(row.P_ID))
        .filter((id) => Number.isInteger(id) && id > 0);

      if (assignedPatientIds.length === 0) {
        return res.json(formatResponse(true, 'No telemedicine sessions found', []));
      }

      whereClause.P_ID = { [Op.in]: assignedPatientIds };
      whereClause.requestStatus = { [Op.in]: ['STAFF_APPROVED', 'DOCTOR_SCHEDULED'] };
    } else {
      return res.status(403).json(formatResponse(false, 'This role cannot access telemedicine sessions'));
    }

    const sessions = await Telemedicine.findAll({
      where: whereClause,
      include: [
        {
          model: Doctor,
          attributes: ['id', 'department', 'Dept_ID', 'speciality'],
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
          required: false,
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
          required: false,
        },
        {
          model: User,
          as: 'PatientUser',
          attributes: ['id', 'name', 'email', 'phone'],
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
