// models/patient.model.js
export default (sequelize, DataTypes) => {
    return sequelize.define('Patient', {
      id: { type: DataTypes.INTEGER, primaryKey: true, field: 'P_ID' }
    }, {
      tableName: 'Patient',
      timestamps: true
    });
  };
  