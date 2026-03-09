// src/controllers/reportController.js
import Report from '../models/report.model.js';
import { formatResponse } from '../utils/responseFormatter.js';
import { handleError } from '../utils/errorHandler.js';

// Create a new report
export const createReport = async (req, res) => {
  try {
    const report = await Report.create(req.body);
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
    res.json(formatResponse(true, 'All reports fetched', reports));
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
