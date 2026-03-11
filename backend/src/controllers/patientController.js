// src/controllers/patientController.js
import { Patient, User } from '../models/index.js';
import { formatResponse } from '../utils/responseFormatter.js';
import { handleError } from '../utils/errorHandler.js';

// Get logged-in patient's full profile (User + Patient sub-table)
export const getMyPatientProfile = async (req, res) => {
  try {
    const [user, patient] = await Promise.all([
      User.findByPk(req.user.id),
      Patient.findByPk(req.user.id),
    ]);
    if (!user) return res.status(404).json(formatResponse(false, 'User not found'));

    return res.json(formatResponse(true, 'Patient profile fetched', {
      id:               user.id,
      name:             user.name,
      email:            user.email,
      phone:            user.phone,
      address:          user.address,
      gender:           user.gender,
      profileUrl:       user.profileUrl,
      dateOfBirth:      patient?.dateOfBirth   || '',
      bloodGroup:       patient?.bloodGroup     || '',
      emergencyContact: patient?.emergencyContact || '',
      allergies:        patient?.allergies      || '',
      medicalHistory:   patient?.medicalHistory  || '',
    }));
  } catch (err) {
    return handleError(res, err);
  }
};

// Update logged-in patient's profile
export const updateMyPatientProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json(formatResponse(false, 'User not found'));

    const [patient] = await Patient.findOrCreate({
      where: { id: req.user.id },
      defaults: { id: req.user.id },
    });

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

    const patientFields = ['dateOfBirth', 'bloodGroup', 'emergencyContact', 'allergies', 'medicalHistory'];
    const patientUpdates = {};
    for (const f of patientFields) {
      if (req.body[f] !== undefined) patientUpdates[f] = req.body[f];
    }

    await Promise.all([
      Object.keys(userUpdates).length ? user.update(userUpdates) : Promise.resolve(),
      Object.keys(patientUpdates).length ? patient.update(patientUpdates) : Promise.resolve(),
    ]);

    return res.json(formatResponse(true, 'Patient profile updated', {
      id:               user.id,
      name:             userUpdates.name             ?? user.name,
      email:            userUpdates.email            ?? user.email,
      phone:            userUpdates.phone            ?? user.phone,
      address:          userUpdates.address          ?? user.address,
      gender:           userUpdates.gender           ?? user.gender,
      profileUrl:       userUpdates.profileUrl       ?? user.profileUrl,
      dateOfBirth:      patientUpdates.dateOfBirth      ?? patient.dateOfBirth      ?? '',
      bloodGroup:       patientUpdates.bloodGroup       ?? patient.bloodGroup       ?? '',
      emergencyContact: patientUpdates.emergencyContact ?? patient.emergencyContact ?? '',
      allergies:        patientUpdates.allergies        ?? patient.allergies        ?? '',
      medicalHistory:   patientUpdates.medicalHistory   ?? patient.medicalHistory   ?? '',
    }));
  } catch (err) {
    return handleError(res, err);
  }
};

// Create a new patient
export const createPatient = async (req, res) => {
  try {
    const patient = await Patient.create(req.body);
    res.status(201).json(formatResponse(true, 'Patient created', patient));
  } catch (err) {
    handleError(res, err);
  }
};

// Get all patients
export const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.findAll();
    res.json(formatResponse(true, 'All patients fetched', patients));
  } catch (err) {
    handleError(res, err);
  }
};

// Get patient by ID
export const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) return res.status(404).json(formatResponse(false, 'Patient not found'));
    res.json(formatResponse(true, 'Patient fetched', patient));
  } catch (err) {
    handleError(res, err);
  }
};

// Update patient by ID
export const updatePatient = async (req, res) => {
  try {
    const [updatedCount, updatedPatients] = await Patient.update(req.body, {
      where: { id: req.params.id },
      returning: true,
    });
    if (updatedCount === 0) return res.status(404).json(formatResponse(false, 'Patient not found'));
    res.json(formatResponse(true, 'Patient updated', updatedPatients[0]));
  } catch (err) {
    handleError(res, err);
  }
};

// Delete patient by ID
export const deletePatient = async (req, res) => {
  try {
    const deleted = await Patient.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json(formatResponse(false, 'Patient not found'));
    res.json(formatResponse(true, 'Patient deleted'));
  } catch (err) {
    handleError(res, err);
  }
};
