// models/doctor.model.js
export default (sequelize, DataTypes) => {
    return sequelize.define('Doctor', {
      id:              { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'D_ID' },
      speciality:      { type: DataTypes.STRING, field: 'Speciality',        allowNull: true },
      department:      { type: DataTypes.STRING, field: 'Department',        allowNull: true },
      timeSchedule:    { type: DataTypes.STRING, field: 'Time_Schedule',     allowNull: true },
      Dept_ID:         { type: DataTypes.INTEGER,                            allowNull: true },
      licenseNumber:   { type: DataTypes.STRING, field: 'License_Number',    allowNull: true },
      experience:      { type: DataTypes.STRING, field: 'Experience',        allowNull: true },
      consultationFee: { type: DataTypes.STRING, field: 'Consultation_Fee',  allowNull: true },
      availableDays:   { type: DataTypes.STRING, field: 'Available_Days',    allowNull: true },
      availableTime:   { type: DataTypes.STRING, field: 'Available_Time',    allowNull: true },
      bio:             { type: DataTypes.TEXT,   field: 'Bio',               allowNull: true },
      qualification:   { type: DataTypes.TEXT,   field: 'Qualification',     allowNull: true },
      profileUrl:      { type: DataTypes.TEXT('long'), field: 'D_Profile',   allowNull: true },
    }, {
      tableName: 'Doctor',
      timestamps: true
    });
  };
  