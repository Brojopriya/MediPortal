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

// Join tables
const NursePatient = NursePatientModel(sequelize, DataTypes);
const StaffReport = StaffReportModel(sequelize, DataTypes);

/* ========== Associations ========== */

// ISA: subclass tables reference Users (one-to-one)
User.hasOne(Patient, { foreignKey: 'P_ID', sourceKey: 'id', onDelete: 'CASCADE' });
Patient.belongsTo(User, { foreignKey: 'P_ID', targetKey: 'id' });

User.hasOne(Doctor, { foreignKey: 'D_ID', sourceKey: 'id', onDelete: 'CASCADE' });
Doctor.belongsTo(User, { foreignKey: 'D_ID', targetKey: 'id' });

User.hasOne(Nurse, { foreignKey: 'N_ID', sourceKey: 'id', onDelete: 'CASCADE' });
Nurse.belongsTo(User, { foreignKey: 'N_ID', targetKey: 'id' });

User.hasOne(MedicalStaff, { foreignKey: 'U_ID', sourceKey: 'id', onDelete: 'CASCADE' });
MedicalStaff.belongsTo(User, { foreignKey: 'U_ID', targetKey: 'id' });

// Hospital contains Departments
Hospital.hasMany(Department, { foreignKey: 'H_ID' });
Department.belongsTo(Hospital, { foreignKey: 'H_ID' });

// Department maintains Wards
Department.hasMany(Ward, { foreignKey: 'Dept_ID' });
Ward.belongsTo(Department, { foreignKey: 'Dept_ID' });

// EmergencySector belongs to Hospital
Hospital.hasMany(EmergencySector, { foreignKey: 'H_ID' });
EmergencySector.belongsTo(Hospital, { foreignKey: 'H_ID' });

// Doctor works in Department
Department.hasMany(Doctor, { foreignKey: 'Dept_ID' });
Doctor.belongsTo(Department, { foreignKey: 'Dept_ID' });

// MedicalStaff assigned to Department or EmergencySector
Department.hasMany(MedicalStaff, { foreignKey: 'Dept_ID' });
MedicalStaff.belongsTo(Department, { foreignKey: 'Dept_ID' });

EmergencySector.hasMany(MedicalStaff, { foreignKey: 'SEC_ID' });
MedicalStaff.belongsTo(EmergencySector, { foreignKey: 'SEC_ID' });

// Ward – Nurse assigned to Ward
Ward.hasMany(Nurse, { foreignKey: 'W_ID' });
Nurse.belongsTo(Ward, { foreignKey: 'W_ID' });

// Doctor performs Appointments; Patient takes Appointments
Doctor.hasMany(Appointment, { foreignKey: 'D_ID' });
Appointment.belongsTo(Doctor, { foreignKey: 'D_ID' });

Patient.hasMany(Appointment, { foreignKey: 'P_ID' });
Appointment.belongsTo(Patient, { foreignKey: 'P_ID' });

// Diagnosis belongs to Patient
Patient.hasMany(Diagnosis, { foreignKey: 'P_ID' });
Diagnosis.belongsTo(Patient, { foreignKey: 'P_ID' });

// Report -> Diagnosis, MedicalStaff (preparer), Patient
Diagnosis.hasMany(Report, { foreignKey: 'Test_ID' });
Report.belongsTo(Diagnosis, { foreignKey: 'Test_ID' });

MedicalStaff.hasMany(Report, { foreignKey: 'S_ID' });
Report.belongsTo(MedicalStaff, { foreignKey: 'S_ID' });

Patient.hasMany(Report, { foreignKey: 'P_ID' });
Report.belongsTo(Patient, { foreignKey: 'P_ID' });

// Telemedicine: doctor <-> patient
Doctor.hasMany(Telemedicine, { foreignKey: 'D_ID' });
Telemedicine.belongsTo(Doctor, { foreignKey: 'D_ID' });

Patient.hasMany(Telemedicine, { foreignKey: 'P_ID' });
Telemedicine.belongsTo(Patient, { foreignKey: 'P_ID' });

// Many-to-many: Nurse <-> Patient (Nurse_Patient)
Nurse.belongsToMany(Patient, { through: NursePatient, foreignKey: 'N_ID', otherKey: 'P_ID' });
Patient.belongsToMany(Nurse, { through: NursePatient, foreignKey: 'P_ID', otherKey: 'N_ID' });

// Many-to-many: MedicalStaff <-> Report (Staff_Report)
MedicalStaff.belongsToMany(Report, { through: StaffReport, foreignKey: 'S_ID', otherKey: 'R_ID' });
Report.belongsToMany(MedicalStaff, { through: StaffReport, foreignKey: 'R_ID', otherKey: 'S_ID' });

export {
  sequelize,
  User, Hospital, Department, Ward, EmergencySector,
  MedicalStaff, Patient, Doctor, Nurse, Appointment,
  Diagnosis, Report, Telemedicine, NursePatient, StaffReport,
  SiteSetting
};
