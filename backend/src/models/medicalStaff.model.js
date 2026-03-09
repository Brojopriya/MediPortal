// models/medicalStaff.model.js
export default (sequelize, DataTypes) => {
    return sequelize.define('MedicalStaff', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'S_ID' },
      U_ID: { type: DataTypes.INTEGER, allowNull: true, unique: true },
      sector: { type: DataTypes.STRING, field: 'S_Sector' },
      department: { type: DataTypes.STRING, field: 'Department' },
      timeSchedule: { type: DataTypes.STRING, field: 'Time_Schedule' },
      Dept_ID: { type: DataTypes.INTEGER, allowNull: true },
      SEC_ID: { type: DataTypes.INTEGER, allowNull: true }
    }, {
      tableName: 'MedicalStaff',
      timestamps: true
    });
  };
  