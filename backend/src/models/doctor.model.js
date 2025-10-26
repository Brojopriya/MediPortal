// models/doctor.model.js
export default (sequelize, DataTypes) => {
    return sequelize.define('Doctor', {
      id: { type: DataTypes.INTEGER, primaryKey: true, field: 'D_ID' },
      speciality: { type: DataTypes.STRING, field: 'Speciality' },
      Dept_ID: { type: DataTypes.INTEGER, allowNull: true }
    }, {
      tableName: 'Doctor',
      timestamps: true
    });
  };
  