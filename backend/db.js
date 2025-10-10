// backend/db.js
import sequelize from './config/database.js';

// Import all models
import User from './models/User.js';
import Admin from './models/Admin.js';
import Doctor from './models/Doctor.js';
import Patient from './models/Patient.js';
import Nurse from './models/Nurse.js';
import MedicalStaff from './models/MedicalStaff.js';
import Appointment from './models/Appointment.js';
import Telemedicine from './models/Telemedicine.js';
import Prescription from './models/Prescription.js';
import LabTest from './models/LabTest.js';
import Serves from './models/Serves.js';
import Treats from './models/Treats.js';

// Initialize models
const models = {
  User: User.initModel(sequelize),
  Admin: Admin.initModel(sequelize),
  Doctor: Doctor.initModel(sequelize),
  Patient: Patient.initModel(sequelize),
  Nurse: Nurse.initModel(sequelize),
  MedicalStaff: MedicalStaff.initModel(sequelize),
  Appointment: Appointment.initModel(sequelize),
  Telemedicine: Telemedicine.initModel(sequelize),
  Prescription: Prescription.initModel(sequelize),
  LabTest: LabTest.initModel(sequelize),
  Serves: Serves.initModel(sequelize),
  Treats: Treats.initModel(sequelize),
};

// ===== Associations =====

// User ↔ Admin/Doctor/Patient/Nurse/MedicalStaff
models.User.hasOne(models.Admin, { foreignKey: 'userID', as: 'adminProfile' });
models.Admin.belongsTo(models.User, { foreignKey: 'userID', as: 'user' });

models.User.hasOne(models.Doctor, { foreignKey: 'userID', as: 'doctorProfile' });
models.Doctor.belongsTo(models.User, { foreignKey: 'userID', as: 'user' });

models.User.hasOne(models.Patient, { foreignKey: 'userID', as: 'patientProfile' });
models.Patient.belongsTo(models.User, { foreignKey: 'userID', as: 'user' });

models.User.hasOne(models.Nurse, { foreignKey: 'userID', as: 'nurseProfile' });
models.Nurse.belongsTo(models.User, { foreignKey: 'userID', as: 'user' });

models.User.hasOne(models.MedicalStaff, { foreignKey: 'userID', as: 'staffProfile' });
models.MedicalStaff.belongsTo(models.User, { foreignKey: 'userID', as: 'user' });

// Admin ↔ Doctor/Patient/Nurse/MedicalStaff/Appointment/Telemedicine
models.Admin.hasMany(models.Doctor, { foreignKey: 'adminID', as: 'doctors' });
models.Doctor.belongsTo(models.Admin, { foreignKey: 'adminID', as: 'admin' });

models.Admin.hasMany(models.Patient, { foreignKey: 'adminID', as: 'patients' });
models.Patient.belongsTo(models.Admin, { foreignKey: 'adminID', as: 'admin' });

models.Admin.hasMany(models.Nurse, { foreignKey: 'adminID', as: 'nurses' });
models.Nurse.belongsTo(models.Admin, { foreignKey: 'adminID', as: 'admin' });

models.Admin.hasMany(models.MedicalStaff, { foreignKey: 'adminID', as: 'staffs' });
models.MedicalStaff.belongsTo(models.Admin, { foreignKey: 'adminID', as: 'admin' });

models.Admin.hasMany(models.Appointment, { foreignKey: 'adminID', as: 'appointments' });
models.Appointment.belongsTo(models.Admin, { foreignKey: 'adminID', as: 'admin' });

models.Admin.hasMany(models.Telemedicine, { foreignKey: 'adminID', as: 'telemedicines' });
models.Telemedicine.belongsTo(models.Admin, { foreignKey: 'adminID', as: 'admin' });

// Doctor ↔ Appointment / Patient / Treats
models.Doctor.hasMany(models.Appointment, { foreignKey: 'drID', as: 'appointments' });
models.Appointment.belongsTo(models.Doctor, { foreignKey: 'drID', as: 'doctor' });

models.Doctor.belongsToMany(models.Patient, { through: models.Treats, foreignKey: 'drID', as: 'treatedPatients' });
models.Patient.belongsToMany(models.Doctor, { through: models.Treats, foreignKey: 'paID', as: 'doctorsTreating' });

// Doctor ↔ Telemedicine / Prescription / LabTest
models.Doctor.hasMany(models.Telemedicine, { foreignKey: 'drID', as: 'telemedicines' });
models.Telemedicine.belongsTo(models.Doctor, { foreignKey: 'drID', as: 'doctor' });

models.Doctor.hasMany(models.Prescription, { foreignKey: 'drID', as: 'prescriptions' });
models.Prescription.belongsTo(models.Doctor, { foreignKey: 'drID', as: 'doctor' });

models.Doctor.hasMany(models.LabTest, { foreignKey: 'drID', as: 'labTests' });
models.LabTest.belongsTo(models.Doctor, { foreignKey: 'drID', as: 'doctor' });

// Patient ↔ Appointment / Telemedicine / Prescription / LabTest / Nurse
models.Patient.hasMany(models.Appointment, { foreignKey: 'paID', as: 'appointments' });
models.Appointment.belongsTo(models.Patient, { foreignKey: 'paID', as: 'patient' });

models.Patient.hasMany(models.Telemedicine, { foreignKey: 'paID', as: 'telemedicines' });
models.Telemedicine.belongsTo(models.Patient, { foreignKey: 'paID', as: 'patient' });

models.Patient.hasMany(models.Prescription, { foreignKey: 'paID', as: 'prescriptions' });
models.Prescription.belongsTo(models.Patient, { foreignKey: 'paID', as: 'patient' });

models.Patient.hasMany(models.LabTest, { foreignKey: 'paID', as: 'labTests' });
models.LabTest.belongsTo(models.Patient, { foreignKey: 'paID', as: 'patient' });

models.Patient.belongsToMany(models.Nurse, { through: models.Serves, foreignKey: 'paID', as: 'nurses' });
models.Nurse.belongsToMany(models.Patient, { through: models.Serves, foreignKey: 'nurseID', as: 'patients' });

// MedicalStaff ↔ LabTest
models.MedicalStaff.hasMany(models.LabTest, { foreignKey: 'staffID', as: 'labTests' });
models.LabTest.belongsTo(models.MedicalStaff, { foreignKey: 'staffID', as: 'staff' });

// Telemedicine ↔ Appointment
models.Appointment.hasMany(models.Telemedicine, { foreignKey: 'appID', as: 'telemedicines' });
models.Telemedicine.belongsTo(models.Appointment, { foreignKey: 'appID', as: 'appointment' });

// ===== Sync Database =====
sequelize.sync({ alter: true })
  .then(() => console.log('✅ All models synced successfully!'))
  .catch(err => console.error('❌ Error syncing models:', err));

export { sequelize, models };
