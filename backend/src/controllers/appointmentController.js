// src/controllers/appointmentController.js
import { Appointment, Doctor, User } from '../models/index.js';
import { formatResponse } from '../utils/responseFormatter.js';
import { handleError } from '../utils/errorHandler.js';

const parseTimeToMinutes = (value) => {
  if (value === undefined || value === null) {
    return null;
  }

  const text = String(value).trim().toLowerCase();
  const match = text.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!match) {
    return null;
  }

  let hour = Number(match[1]);
  const minute = Number(match[2] || 0);
  const meridiem = (match[3] || '').toLowerCase();

  if (!Number.isInteger(hour) || !Number.isInteger(minute) || minute < 0 || minute > 59) {
    return null;
  }

  if (meridiem) {
    if (hour < 1 || hour > 12) {
      return null;
    }
    if (meridiem === 'pm' && hour !== 12) {
      hour += 12;
    }
    if (meridiem === 'am' && hour === 12) {
      hour = 0;
    }
  } else if (hour < 0 || hour > 23) {
    return null;
  }

  return (hour * 60) + minute;
};

const parseScheduleRanges = (scheduleText) => {
  if (!scheduleText) {
    return [];
  }

  const normalized = String(scheduleText)
    .replace(/\bto\b/gi, '-')
    .replace(/\s+/g, ' ')
    .trim();

  if (!normalized) {
    return [];
  }

  const chunks = normalized.split(/[;,]/).map((part) => part.trim()).filter(Boolean);
  const ranges = [];

  for (const chunk of chunks) {
    const tokens = chunk.match(/\d{1,2}(?::\d{2})?\s*(?:am|pm)?/gi) || [];
    if (tokens.length < 2) {
      continue;
    }

    const start = parseTimeToMinutes(tokens[0]);
    const end = parseTimeToMinutes(tokens[1]);
    if (start === null || end === null || start > end) {
      continue;
    }

    ranges.push({ start, end });
  }

  return ranges;
};

const isWithinRanges = (timeInMinutes, ranges) => {
  return ranges.some((range) => timeInMinutes >= range.start && timeInMinutes <= range.end);
};

const DAY_ALIASES = {
  mon: 1,
  monday: 1,
  tue: 2,
  tues: 2,
  tuesday: 2,
  wed: 3,
  wednesday: 3,
  thu: 4,
  thur: 4,
  thurs: 4,
  thursday: 4,
  fri: 5,
  friday: 5,
  sat: 6,
  saturday: 6,
  sun: 0,
  sunday: 0,
};

const enrichAppointments = async (appointments) => {
  const doctorIds = [...new Set(appointments.map((appointment) => appointment.D_ID).filter(Boolean))];
  if (!doctorIds.length) {
    return appointments.map((appointment) => appointment.toJSON());
  }

  const [doctorUsers, doctorProfiles] = await Promise.all([
    User.findAll({
      where: { id: doctorIds, role: 'DOCTOR' },
      attributes: ['id', 'name'],
    }),
    Doctor.findAll({
      where: { id: doctorIds },
      attributes: ['id', 'speciality', 'department', 'timeSchedule', 'availableTime', 'availableDays'],
    }),
  ]);

  const doctorUserMap = new Map(doctorUsers.map((user) => [user.id, user]));
  const doctorProfileMap = new Map(doctorProfiles.map((doctor) => [doctor.id, doctor]));

  return appointments.map((appointment) => {
    const row = appointment.toJSON();
    const doctorUser = doctorUserMap.get(row.D_ID);
    const doctorProfile = doctorProfileMap.get(row.D_ID);

    return {
      ...row,
      doctorName: row.doctorName || doctorUser?.name || null,
      doctorSpecialty: doctorProfile?.speciality || null,
      doctorDepartment: doctorProfile?.department || null,
      doctorAvailableTime: doctorProfile?.availableTime || doctorProfile?.timeSchedule || null,
      doctorAvailableDays: doctorProfile?.availableDays || null,
    };
  });
};

const parseAvailableDays = (daysText) => {
  if (!daysText) {
    return null;
  }

  const normalized = String(daysText)
    .toLowerCase()
    .replace(/\band\b/g, ',')
    .replace(/\bto\b/g, '-')
    .replace(/\s+/g, ' ')
    .trim();

  if (!normalized || normalized === 'daily' || normalized === 'everyday' || normalized === 'all days') {
    return new Set([0, 1, 2, 3, 4, 5, 6]);
  }

  const segments = normalized.split(',').map((item) => item.trim()).filter(Boolean);
  const result = new Set();

  for (const segment of segments) {
    if (segment.includes('-')) {
      const [leftRaw, rightRaw] = segment.split('-').map((part) => part.trim());
      const left = DAY_ALIASES[leftRaw];
      const right = DAY_ALIASES[rightRaw];
      if (left === undefined || right === undefined) {
        continue;
      }

      if (left <= right) {
        for (let i = left; i <= right; i += 1) {
          result.add(i);
        }
      } else {
        for (let i = left; i <= 6; i += 1) {
          result.add(i);
        }
        for (let i = 0; i <= right; i += 1) {
          result.add(i);
        }
      }
      continue;
    }

    const mapped = DAY_ALIASES[segment];
    if (mapped !== undefined) {
      result.add(mapped);
    }
  }

  return result.size ? result : null;
};

// Create a new appointment
export const createAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.create(req.body);
    res.status(201).json(formatResponse(true, 'Appointment created', appointment));
  } catch (err) {
    handleError(res, err);
  }
};

// Get all appointments
export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll();
    res.json(formatResponse(true, 'All appointments fetched', await enrichAppointments(appointments)));
  } catch (err) {
    handleError(res, err);
  }
};

// Get appointment by ID
export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) return res.status(404).json(formatResponse(false, 'Appointment not found'));
    res.json(formatResponse(true, 'Appointment fetched', appointment));
  } catch (err) {
    handleError(res, err);
  }
};

// Update appointment by ID
export const updateAppointment = async (req, res) => {
  try {
    const [updatedCount, updatedAppointments] = await Appointment.update(req.body, {
      where: { id: req.params.id },
      returning: true, // returns the updated record
    });
    if (updatedCount === 0) return res.status(404).json(formatResponse(false, 'Appointment not found'));
    res.json(formatResponse(true, 'Appointment updated', updatedAppointments[0]));
  } catch (err) {
    handleError(res, err);
  }
};

// Delete appointment by ID
export const deleteAppointment = async (req, res) => {
  try {
    const deleted = await Appointment.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json(formatResponse(false, 'Appointment not found'));
    res.json(formatResponse(true, 'Appointment deleted'));
  } catch (err) {
    handleError(res, err);
  }
};

// Patient books an appointment with a doctor.
export const bookAppointment = async (req, res) => {
  try {
    const { date, time, D_ID } = req.body;
    if (!date || !D_ID) {
      return res.status(400).json(formatResponse(false, 'date and D_ID are required'));
    }

    const doctorId = Number(D_ID);
    if (!Number.isInteger(doctorId) || doctorId <= 0) {
      return res.status(400).json(formatResponse(false, 'Valid doctor id is required'));
    }

    const [doctor, doctorUser] = await Promise.all([
      Doctor.findByPk(doctorId, {
        attributes: ['id', 'timeSchedule', 'availableTime', 'availableDays'],
      }),
      User.findByPk(doctorId, { attributes: ['id', 'role', 'professionalDetails'] }),
    ]);
    if (!doctor) {
      return res.status(404).json(formatResponse(false, 'Doctor not found'));
    }

    if (!doctorUser || String(doctorUser.role || '').toUpperCase() !== 'DOCTOR') {
      return res.status(404).json(formatResponse(false, 'Doctor not found'));
    }

    let details = {};
    try {
      details = doctorUser.professionalDetails ? JSON.parse(doctorUser.professionalDetails) : {};
    } catch {
      details = {};
    }

    const appointmentDate = new Date(`${date}T00:00:00`);
    if (Number.isNaN(appointmentDate.getTime())) {
      return res.status(400).json(formatResponse(false, 'Invalid appointment date format'));
    }

    const availableDaysText = String(doctor.availableDays || details.availableDays || '').trim();
    if (availableDaysText) {
      const allowedDays = parseAvailableDays(availableDaysText);
      if (!allowedDays) {
        return res.status(400).json(
          formatResponse(false, 'Doctor available-days format is invalid. Please ask admin to update available days.')
        );
      }

      const dayOfWeek = appointmentDate.getDay();
      if (!allowedDays.has(dayOfWeek)) {
        return res.status(400).json(
          formatResponse(false, `Appointment date must be within doctor's available days (${availableDaysText})`)
        );
      }
    }

    const normalizedTime = String(time || '').trim();
    if (normalizedTime) {
      const appointmentMinutes = parseTimeToMinutes(normalizedTime);
      if (appointmentMinutes === null) {
        return res.status(400).json(formatResponse(false, 'Invalid appointment time format'));
      }

      const scheduleText = String(doctor.availableTime || details.availableTime || doctor.timeSchedule || '').trim();
      if (scheduleText) {
        const ranges = parseScheduleRanges(scheduleText);
        if (!ranges.length) {
          return res.status(400).json(
            formatResponse(false, 'Doctor schedule format is invalid. Please ask admin to update available time.')
          );
        }

        if (!isWithinRanges(appointmentMinutes, ranges)) {
          return res.status(400).json(
            formatResponse(false, `Appointment time must be within doctor's available time (${scheduleText})`)
          );
        }
      }
    }

    const appointment = await Appointment.create({
      date,
      time: normalizedTime || null,
      D_ID: doctorId,
      P_ID: req.user.id,
    });

    return res.status(201).json(formatResponse(true, 'Appointment booked successfully', appointment));
  } catch (err) {
    return handleError(res, err);
  }
};

// Patient sees their own appointments.
export const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      where: { P_ID: req.user.id },
      order: [['date', 'DESC'], ['time', 'DESC']],
    });
    return res.json(formatResponse(true, 'My appointments fetched', await enrichAppointments(appointments)));
  } catch (err) {
    return handleError(res, err);
  }
};

// Doctor sees appointments assigned to them.
export const getDoctorAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      where: { D_ID: req.user.id },
      order: [['date', 'DESC'], ['time', 'DESC']],
    });

    const patientIds = [...new Set(appointments.map((a) => a.P_ID).filter(Boolean))];
    const patients = patientIds.length
      ? await User.findAll({
          where: { id: patientIds },
          attributes: ['id', 'name', 'email', 'phone'],
        })
      : [];

    const patientMap = new Map(patients.map((p) => [p.id, p]));
    const payload = appointments.map((appointment) => {
      const row = appointment.toJSON();
      const patient = row.P_ID ? patientMap.get(row.P_ID) : null;
      return {
        ...row,
        patientName: patient?.name || null,
        patientEmail: patient?.email || null,
        patientPhone: patient?.phone || null,
      };
    });

    return res.json(formatResponse(true, 'Doctor appointments fetched', payload));
  } catch (err) {
    return handleError(res, err);
  }
};
