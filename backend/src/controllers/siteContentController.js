import { SiteSetting } from '../models/index.js';
import { formatResponse } from '../utils/responseFormatter.js';
import { handleError } from '../utils/errorHandler.js';

const DEFAULT_CONTENT = {
  heroTitle: 'Care when you need it - from anywhere',
  heroSubtitle:
    'MediPortal connects you to verified doctors, manages appointments and medical records, and provides telemedicine - fast, secure, and reliable.',
  emergencyContact: '+1 234 567 890',
  aboutHospital:
    'MediPortal connects patients, doctors, nurses, and medical staff through one secure healthcare platform for appointments, telemedicine, reports, and coordinated care.',
  contactAddress: '123 Health St., City',
  contactPhone: '+1 234 567 89',
  contactEmail: 'info@mediportal.example',
  footerAbout:
    'Your trusted healthcare companion - connecting patients with quality medical care.'
};

const parseSettingValue = (raw) => {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
};

const stringifySettingValue = (value) => {
  if (typeof value === 'string') {
    return value;
  }
  return JSON.stringify(value);
};

const toMap = (rows) => {
  const content = { ...DEFAULT_CONTENT };
  rows.forEach((row) => {
    content[row.key] = parseSettingValue(row.value);
  });
  return content;
};

export const getPublicSiteContent = async (req, res) => {
  try {
    const rows = await SiteSetting.findAll({ order: [['key', 'ASC']] });
    return res.json(formatResponse(true, 'Site content fetched', toMap(rows)));
  } catch (err) {
    return handleError(res, err);
  }
};

export const updateSiteContent = async (req, res) => {
  try {
    const payload = req.body || {};
    const entries = Object.entries(payload).filter(([, value]) => value !== undefined);

    if (entries.length === 0) {
      return res.status(400).json(formatResponse(false, 'Provide at least one field to update'));
    }

    for (const [key, value] of entries) {
      const storedValue = stringifySettingValue(value);
      const existing = await SiteSetting.findOne({ where: { key } });

      if (existing) {
        existing.value = storedValue;
        await existing.save();
      } else {
        await SiteSetting.create({ key, value: storedValue });
      }
    }

    const rows = await SiteSetting.findAll({ order: [['key', 'ASC']] });
    return res.json(formatResponse(true, 'Site content updated', toMap(rows)));
  } catch (err) {
    return handleError(res, err);
  }
};
