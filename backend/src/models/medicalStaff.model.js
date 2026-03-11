// models/medicalStaff.model.js
export default (sequelize, DataTypes) => {
    return sequelize.define('MedicalStaff', {
      id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'S_ID' },
      U_ID:         { type: DataTypes.INTEGER, allowNull: true, unique: true },
      sector:       { type: DataTypes.STRING,  field: 'S_Sector',      allowNull: true },
      department:   { type: DataTypes.STRING,  field: 'Department',    allowNull: true },
      timeSchedule: { type: DataTypes.STRING,  field: 'Time_Schedule', allowNull: true },
      Dept_ID:      { type: DataTypes.INTEGER,                         allowNull: true },
      SEC_ID:       { type: DataTypes.INTEGER,                         allowNull: true },
      employeeId:   { type: DataTypes.STRING,  field: 'Employee_ID',   allowNull: true },
      staffRole:    { type: DataTypes.STRING,  field: 'Staff_Role',    allowNull: true },
      dateOfBirth:  { type: DataTypes.DATEONLY,field: 'Date_Of_Birth',  allowNull: true },
      shift:        { type: DataTypes.STRING,  field: 'Shift',         allowNull: true },
      joiningDate:  { type: DataTypes.DATEONLY,field: 'Joining_Date',   allowNull: true },
      experience:   { type: DataTypes.STRING,  field: 'Experience',    allowNull: true },
      qualification:{ type: DataTypes.TEXT,    field: 'Qualification', allowNull: true },
    }, {
      tableName: 'MedicalStaff',
      timestamps: true
    });
  };
  