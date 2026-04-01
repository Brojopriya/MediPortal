import Sequelize from 'sequelize';
import sequelize from '../../config/db.js';

import UserModel from './user.model.js';
import HospitalModel from './hospital.model.js';
import DepartmentModel from './department.model.js';
import WardModel from './ward.model.js';
import EmergencySectorModel from './emergencySector.model.js';
import MedicalStaffModel from './medicalStaff.model.js';
import PatientModel from './patient.model.js';
import DoctorModel from './doctor.model.js';
import NurseModel from './nurse.model.js';
import AppointmentModel from './appointment.model.js';
import DiagnosisModel from './diagnosis.model.js';
import ReportModel from './report.model.js';
import TelemedicineModel from './telemedicine.model.js';
import SiteSettingModel from './siteSetting.model.js';
import FeedbackModel from './feedback.model.js';

// Join tables
import NursePatientModel from './nurse_patient.model.js';
import StaffReportModel from './staff_report.model.js';

const DataTypes = Sequelize.DataTypes;

// Initialize models
const User = UserModel(sequelize, DataTypes);
const Hospital = HospitalModel(sequelize, DataTypes);
const Department = DepartmentModel(sequelize, DataTypes);
const Ward = WardModel(sequelize, DataTypes);
const EmergencySector = EmergencySectorModel(sequelize, DataTypes);
const MedicalStaff = MedicalStaffModel(sequelize, DataTypes);
const Patient = PatientModel(sequelize, DataTypes);
const Doctor = DoctorModel(sequelize, DataTypes);
const Nurse = NurseModel(sequelize, DataTypes);
const Appointment = AppointmentModel(sequelize, DataTypes);
const Diagnosis = DiagnosisModel(sequelize, DataTypes);
const Report = ReportModel(sequelize, DataTypes);
const Telemedicine = TelemedicineModel(sequelize, DataTypes);
const SiteSetting = SiteSettingModel(sequelize, DataTypes);
const Feedback = FeedbackModel(sequelize, DataTypes);

// Join tables
const NursePatient = NursePatientModel(sequelize, DataTypes);
const StaffReport = StaffReportModel(sequelize, DataTypes);

/* ========== Associations ========== */

// ISA: subclass tables reference Users (one-to-one)
User.hasOne(Patient, { foreignKey: 'P_ID', sourceKey: 'id', onDelete: 'CASCADE', constraints: false });
Patient.belongsTo(User, { foreignKey: 'P_ID', targetKey: 'id', constraints: false });

User.hasOne(Doctor, { foreignKey: 'D_ID', sourceKey: 'id', onDelete: 'CASCADE', constraints: false });
Doctor.belongsTo(User, { foreignKey: 'D_ID', targetKey: 'id', constraints: false });

User.hasOne(Nurse, { foreignKey: 'N_ID', sourceKey: 'id', onDelete: 'CASCADE', constraints: false });
Nurse.belongsTo(User, { foreignKey: 'N_ID', targetKey: 'id', constraints: false });

User.hasOne(MedicalStaff, { foreignKey: 'U_ID', sourceKey: 'id', onDelete: 'CASCADE', constraints: false });
MedicalStaff.belongsTo(User, { foreignKey: 'U_ID', targetKey: 'id', constraints: false });

// Hospital contains Departments
Hospital.hasMany(Department, { foreignKey: 'H_ID', constraints: false });
Department.belongsTo(Hospital, { foreignKey: 'H_ID', constraints: false });

// Department maintains Wards
Department.hasMany(Ward, { foreignKey: 'Dept_ID', constraints: false });
Ward.belongsTo(Department, { foreignKey: 'Dept_ID', constraints: false });

// EmergencySector belongs to Hospital
Hospital.hasMany(EmergencySector, { foreignKey: 'H_ID', constraints: false });
EmergencySector.belongsTo(Hospital, { foreignKey: 'H_ID', constraints: false });

// Doctor works in Department
Department.hasMany(Doctor, { foreignKey: 'Dept_ID', constraints: false });
Doctor.belongsTo(Department, { foreignKey: 'Dept_ID', constraints: false });

// MedicalStaff assigned to Department or EmergencySector
Department.hasMany(MedicalStaff, { foreignKey: 'Dept_ID', constraints: false });
MedicalStaff.belongsTo(Department, { foreignKey: 'Dept_ID', constraints: false });

EmergencySector.hasMany(MedicalStaff, { foreignKey: 'SEC_ID', constraints: false });
MedicalStaff.belongsTo(EmergencySector, { foreignKey: 'SEC_ID', constraints: false });

// Ward – Nurse assigned to Ward
Ward.hasMany(Nurse, { foreignKey: 'W_ID', constraints: false });
Nurse.belongsTo(Ward, { foreignKey: 'W_ID', constraints: false });

// Doctor performs Appointments; Patient takes Appointments
Doctor.hasMany(Appointment, { foreignKey: 'D_ID', constraints: false });
Appointment.belongsTo(Doctor, { foreignKey: 'D_ID', constraints: false });

Patient.hasMany(Appointment, { foreignKey: 'P_ID', constraints: false });
Appointment.belongsTo(Patient, { foreignKey: 'P_ID', constraints: false });

// Diagnosis belongs to Patient
Patient.hasMany(Diagnosis, { foreignKey: 'P_ID', constraints: false });
Diagnosis.belongsTo(Patient, { foreignKey: 'P_ID', constraints: false });

// Report -> Diagnosis, MedicalStaff (preparer), Patient
Diagnosis.hasMany(Report, { foreignKey: 'Test_ID', constraints: false });
Report.belongsTo(Diagnosis, { foreignKey: 'Test_ID', constraints: false });

MedicalStaff.hasMany(Report, { foreignKey: 'S_ID', constraints: false });
Report.belongsTo(MedicalStaff, { foreignKey: 'S_ID', constraints: false });

Patient.hasMany(Report, { foreignKey: 'P_ID', constraints: false });
Report.belongsTo(Patient, { foreignKey: 'P_ID', constraints: false });

// Telemedicine: doctor <-> patient
Doctor.hasMany(Telemedicine, { foreignKey: 'D_ID', constraints: false });
Telemedicine.belongsTo(Doctor, { foreignKey: 'D_ID', constraints: false });

Patient.hasMany(Telemedicine, { foreignKey: 'P_ID', constraints: false });
Telemedicine.belongsTo(Patient, { foreignKey: 'P_ID', constraints: false });
Telemedicine.belongsTo(User, { foreignKey: 'P_ID', targetKey: 'id', as: 'PatientUser', constraints: false });

// Feedback belongs to Patient/User
Patient.hasMany(Feedback, { foreignKey: 'P_ID', constraints: false });
Feedback.belongsTo(Patient, { foreignKey: 'P_ID', constraints: false });
User.hasMany(Feedback, { foreignKey: 'P_ID', sourceKey: 'id', constraints: false });
Feedback.belongsTo(User, { foreignKey: 'P_ID', targetKey: 'id', constraints: false });

MedicalStaff.hasMany(Telemedicine, { foreignKey: 'S_ID', constraints: false });
Telemedicine.belongsTo(MedicalStaff, { foreignKey: 'S_ID', constraints: false });

// Many-to-many: Nurse <-> Patient (Nurse_Patient)
Nurse.belongsToMany(Patient, { through: NursePatient, foreignKey: 'N_ID', otherKey: 'P_ID', constraints: false });
Patient.belongsToMany(Nurse, { through: NursePatient, foreignKey: 'P_ID', otherKey: 'N_ID', constraints: false });

// Many-to-many: MedicalStaff <-> Report (Staff_Report)
MedicalStaff.belongsToMany(Report, { through: StaffReport, foreignKey: 'S_ID', otherKey: 'R_ID', constraints: false });
Report.belongsToMany(MedicalStaff, { through: StaffReport, foreignKey: 'R_ID', otherKey: 'S_ID', constraints: false });

export {
  sequelize,
  User, Hospital, Department, Ward, EmergencySector,
  MedicalStaff, Patient, Doctor, Nurse, Appointment,
  Diagnosis, Report, Telemedicine, Feedback, NursePatient, StaffReport,
  SiteSetting
};
