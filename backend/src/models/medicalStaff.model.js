// models/medicalStaff.model.js
export default (sequelize, DataTypes) => {
    return sequelize.define('MedicalStaff', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'S_ID' },
      sector: { type: DataTypes.STRING, field: 'S_Sector' },
      Dept_ID: { type: DataTypes.INTEGER, allowNull: true },
      SEC_ID: { type: DataTypes.INTEGER, allowNull: true }
    }, {
      tableName: 'MedicalStaff',
      timestamps: true
    });
  };
  