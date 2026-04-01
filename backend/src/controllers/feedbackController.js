// src/controllers/feedbackController.js
import { Feedback, User } from '../models/index.js';
import { formatResponse } from '../utils/responseFormatter.js';
import { handleError } from '../utils/errorHandler.js';

const FEEDBACK_CATEGORIES = new Set(['GENERAL', 'UI_UX', 'PERFORMANCE', 'BUG', 'FEATURE']);

export const createFeedback = async (req, res) => {
  try {
    const rawCategory = String(req.body?.category || 'GENERAL').toUpperCase();
    const category = FEEDBACK_CATEGORIES.has(rawCategory) ? rawCategory : 'GENERAL';
    const rating = Number(req.body?.rating || 5);
    const message = String(req.body?.message || '').trim();

    if (!message) {
      return res.status(400).json(formatResponse(false, 'Feedback message is required'));
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json(formatResponse(false, 'Rating must be between 1 and 5'));
    }

    const created = await Feedback.create({
      category,
      rating,
      message,
      P_ID: req.user.id,
    });

    return res.status(201).json(formatResponse(true, 'Feedback submitted successfully', created));
  } catch (err) {
    return handleError(res, err);
  }
};

export const getMyFeedback = async (req, res) => {
  try {
    const rows = await Feedback.findAll({
      where: { P_ID: req.user.id },
      include: [{ model: User, attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']],
      limit: 50,
    });

    return res.json(formatResponse(true, 'Feedback fetched', rows));
  } catch (err) {
    return handleError(res, err);
  }
};

export const getAllFeedback = async (_req, res) => {
  try {
    const rows = await Feedback.findAll({
      include: [{ model: User, attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit: 200,
    });

    return res.json(formatResponse(true, 'All feedback fetched', rows));
  } catch (err) {
    return handleError(res, err);
  }
};

export const getPublicFeedback = async (_req, res) => {
  try {
    const rows = await Feedback.findAll({
      include: [{ model: User, attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']],
      limit: 12,
    });

    return res.json(formatResponse(true, 'Public feedback fetched', rows));
  } catch (err) {
    return handleError(res, err);
  }
};
