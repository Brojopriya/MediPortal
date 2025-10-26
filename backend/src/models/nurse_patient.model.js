// models/nursePatient.model.js
export default (sequelize, DataTypes) => {
    return sequelize.define('Nurse_Patient', {
      N_ID: { type: DataTypes.INTEGER, primaryKey: true, field: 'N_ID' },
      P_ID: { type: DataTypes.INTEGER, primaryKey: true, field: 'P_ID' }
    }, {
      tableName: 'Nurse_Patient',
      timestamps: false
    });
  };
  