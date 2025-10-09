// backend/db.js
import { Sequelize } from 'sequelize';
import sequelizeConfig from './config/database.js'; // your DB connection config

// import models
import User from './models/User.js';
import Doctor from './models/doctor.js';
import Appointment from './models/appointment.js';

// initialize models
const models = {
  User: User.initModel(sequelizeConfig),
  Doctor: Doctor.initModel(sequelizeConfig),
  Appointment: Appointment.initModel(sequelizeConfig),
};

// Associations
models.User.hasMany(models.Appointment, { foreignKey: 'patient_id', as: 'appointments' });
models.Appointment.belongsTo(models.User, { foreignKey: 'patient_id', as: 'patient' });

models.Doctor.hasMany(models.Appointment, { foreignKey: 'doctor_id', as: 'appointments' });
models.Appointment.belongsTo(models.Doctor, { foreignKey: 'doctor_id', as: 'doctor' });

// Sync all models
sequelizeConfig.sync({ alter: true })
  .then(() => console.log('✅ All models synced successfully!'))
  .catch(err => console.error('❌ Error syncing models:', err));

// Export sequelize instance and models
export { sequelizeConfig as sequelize, models };
