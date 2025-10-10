// backend/db.js
import sequelize from './config/database.js';  // this is your Sequelize instance
import User from './models/User.js';
import Doctor from './models/doctor.js';
import Appointment from './models/appointment.js';

// Initialize models
const models = {
  User: User.initModel(sequelize),
  Doctor: Doctor.initModel(sequelize),
  Appointment: Appointment.initModel(sequelize),
};

// Define Associations
models.User.hasMany(models.Appointment, { foreignKey: 'patient_id', as: 'appointments' });
models.Appointment.belongsTo(models.User, { foreignKey: 'patient_id', as: 'patient' });

models.Doctor.hasMany(models.Appointment, { foreignKey: 'doctor_id', as: 'appointments' });
models.Appointment.belongsTo(models.Doctor, { foreignKey: 'doctor_id', as: 'doctor' });

// Each Doctor belongs to a User (to connect doctor details with a user account)
models.Doctor.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });

// Sync all models
sequelize.sync({ alter: true })
  .then(() => console.log('✅ All models synced successfully!'))
  .catch(err => console.error('❌ Error syncing models:', err));

// Export sequelize instance and models
export { sequelize, models };
