// models/index.js
import sequelize from '../db.js'; // Sequelize instance
import User from './User.js';
import Doctor from './doctor.js';
import Appointment from './appointment.js';

// Initialize all models
const models = { User, Doctor, Appointment };

Object.values(models).forEach((model) => {
  if (typeof model.initModel === 'function') model.initModel(sequelize);
});

// Define Associations

// 🧍 User → Appointment (Patient)
models.User.hasMany(models.Appointment, { 
  foreignKey: 'patient_id', 
  as: 'appointments' 
});
models.Appointment.belongsTo(models.User, { 
  foreignKey: 'patient_id', 
  as: 'patient' 
});

// 👨‍⚕️ Doctor → Appointment
models.Doctor.hasMany(models.Appointment, { 
  foreignKey: 'doctor_id', 
  as: 'appointments' 
});
models.Appointment.belongsTo(models.Doctor, { 
  foreignKey: 'doctor_id', 
  as: 'doctor' 
});

// 🧍 User → Doctor (for role linking if needed)
models.User.hasOne(models.Doctor, { 
  foreignKey: 'user_id', 
  as: 'doctorProfile' 
});
models.Doctor.belongsTo(models.User, { 
  foreignKey: 'user_id', 
  as: 'user' 
});

// Export everything
export { sequelize, models };
