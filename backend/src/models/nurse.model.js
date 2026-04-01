// models/nurse.model.js
export default (sequelize, DataTypes) => {
    return sequelize.define('Nurse', {
      id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'N_ID' },
      post:           { type: DataTypes.STRING,  field: 'N_Post',        allowNull: true },
      department:     { type: DataTypes.STRING,  field: 'Department',    allowNull: true },
      timeSchedule:   { type: DataTypes.STRING,  field: 'Time_Schedule', allowNull: true },
      W_ID:           { type: DataTypes.INTEGER,                         allowNull: true },
      employeeId:     { type: DataTypes.STRING,  field: 'Employee_ID',   allowNull: true },
      dateOfBirth:    { type: DataTypes.DATEONLY,field: 'Date_Of_Birth',  allowNull: true },
      shift:          { type: DataTypes.STRING,  field: 'Shift',         allowNull: true },
      specialization: { type: DataTypes.STRING,  field: 'Specialization',allowNull: true },
      licenseNumber:  { type: DataTypes.STRING,  field: 'License_Number',allowNull: true },
      joiningDate:    { type: DataTypes.DATEONLY,field: 'Joining_Date',   allowNull: true },
      experience:     { type: DataTypes.STRING,  field: 'Experience',    allowNull: true },
      qualifications: { type: DataTypes.TEXT,    field: 'Qualifications', allowNull: true },
    }, {
      tableName: 'Nurse',
      timestamps: true
    });
  };
  