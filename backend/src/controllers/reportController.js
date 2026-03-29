// src/controllers/reportController.js
import { Report } from '../models/index.js';
import { Appointment, User } from '../models/index.js';
import { Doctor } from '../models/index.js';
import { formatResponse } from '../utils/responseFormatter.js';
import { handleError } from '../utils/errorHandler.js';

// Create a new report
export const createReport = async (req, res) => {
  try {
    const payload = { ...req.body };
    const reportType = String(payload.reportType || '').toUpperCase();

    // Ensure prescriptions always carry the prescribing doctor identity.
    if (reportType === 'PRESCRIPTION' && req.user?.role === 'DOCTOR') {
      payload.D_ID = req.user.id;
      payload.doctorName = req.user.name || payload.doctorName || null;
      payload.hospitalName = payload.hospitalName || 'MediPortal Hospital';
    }

    const report = await Report.create(payload);
    res.status(201).json(formatResponse(true, 'Report created', report));
  } catch (err) {
    handleError(res, err);
  }
};

// Get all reports
export const getAllReports = async (req, res) => {
  try {
    const whereClause = req.user?.role === 'PATIENT' ? { P_ID: req.user.id } : undefined;
    const reports = await Report.findAll({ where: whereClause, order: [['date', 'DESC']] });

    const enrichedReports = await Promise.all(
      reports.map(async (report) => {
        const reportJson = report.toJSON();
        const isPrescription = String(reportJson.reportType || '').toUpperCase() === 'PRESCRIPTION';

        if (!isPrescription) {
          return reportJson;
        }

        if (reportJson.D_ID) {
          const doctorUser = await User.findByPk(reportJson.D_ID, { attributes: ['id', 'name'] });
          const doctorProfile = await Doctor.findByPk(reportJson.D_ID, { attributes: ['department'] });

          if (doctorUser?.name) {
            reportJson.doctorName = doctorUser.name;
          }

          if (doctorProfile?.department) {
            reportJson.doctorDepartment = doctorProfile.department;
          }

          if (reportJson.doctorName && reportJson.doctorDepartment) {
            return reportJson;
          }
        }

        if (reportJson.P_ID) {
          const fallbackAppointment = await Appointment.findOne({
            where: { P_ID: reportJson.P_ID },
            order: [['date', 'DESC'], ['createdAt', 'DESC']],
            attributes: ['D_ID'],
          });

          const fallbackDoctorId = fallbackAppointment?.D_ID;
          if (fallbackDoctorId) {
            const fallbackDoctor = await User.findByPk(fallbackDoctorId, { attributes: ['id', 'name'] });
            const fallbackDoctorProfile = await Doctor.findByPk(fallbackDoctorId, { attributes: ['department'] });

            reportJson.D_ID = reportJson.D_ID || fallbackDoctorId;

            if (fallbackDoctor?.name) {
              reportJson.doctorName = fallbackDoctor.name;
            }

            if (fallbackDoctorProfile?.department) {
              reportJson.doctorDepartment = fallbackDoctorProfile.department;
            }
          }
        }

        return reportJson;
      })
    );

    res.json(formatResponse(true, 'All reports fetched', enrichedReports));
  } catch (err) {
    handleError(res, err);
  }
};

// Get report by ID
export const getReportById = async (req, res) => {
  try {
    const report = await Report.findByPk(req.params.id);
    if (!report) return res.status(404).json(formatResponse(false, 'Report not found'));
    if (req.user?.role === 'PATIENT' && report.P_ID !== req.user.id) {
      return res.status(403).json(formatResponse(false, 'Forbidden: You can only view your own reports'));
    }
    res.json(formatResponse(true, 'Report fetched', report));
  } catch (err) {
    handleError(res, err);
  }
};

// Update report by ID
export const updateReport = async (req, res) => {
  try {
    const [updatedCount, updatedReports] = await Report.update(req.body, {
      where: { id: req.params.id },
      returning: true,
    });
    if (updatedCount === 0) return res.status(404).json(formatResponse(false, 'Report not found'));
    res.json(formatResponse(true, 'Report updated', updatedReports[0]));
  } catch (err) {
    handleError(res, err);
  }
};

// Delete report by ID
export const deleteReport = async (req, res) => {
  try {
    const deleted = await Report.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json(formatResponse(false, 'Report not found'));
    res.json(formatResponse(true, 'Report deleted'));
  } catch (err) {
    handleError(res, err);
  }
};
