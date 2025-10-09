// models/index.js
import sequelize from '../db.js';  // note .js extension
import User from './User.js';
import Doctor from './doctor.js';
import Appointment from './appointment.js';

const models = { User, Doctor, Appointment };

// Initialize models
Object.values(models).forEach((m) => {
  if (typeof m.initModel === 'function') m.initModel(sequelize);
});

// Associations
models.User.hasMany(models.Appointment, { foreignKey: 'patient_id', as: 'appointments' });
models.Appointment.belongsTo(models.User, { foreignKey: 'patient_id', as: 'patient' });

models.Doctor.hasMany(models.Appointment, { foreignKey: 'doctor_id', as: 'appointments' });
models.Appointment.belongsTo(models.Doctor, { foreignKey: 'doctor_id', as: 'doctor' });

export { sequelize, models };
