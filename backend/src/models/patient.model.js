// models/patient.model.js
export default (sequelize, DataTypes) => {
    return sequelize.define('Patient', {
      id:               { type: DataTypes.INTEGER, primaryKey: true, field: 'P_ID' },
      bloodGroup:       { type: DataTypes.STRING, field: 'Blood_Group',       allowNull: true },
      dateOfBirth:      { type: DataTypes.DATEONLY, field: 'Date_Of_Birth',    allowNull: true },
      emergencyContact: { type: DataTypes.STRING, field: 'Emergency_Contact',  allowNull: true },
      allergies:        { type: DataTypes.TEXT,   field: 'Allergies',          allowNull: true },
      medicalHistory:   { type: DataTypes.TEXT,   field: 'Medical_History',    allowNull: true },
    }, {
      tableName: 'Patient',
      timestamps: true
    });
  };
  