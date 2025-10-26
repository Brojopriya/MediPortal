// models/appointment.model.js
export default (sequelize, DataTypes) => {
    return sequelize.define('Appointment', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'A_ID' },
      date: { type: DataTypes.DATEONLY, field: 'A_Date' },
      time: { type: DataTypes.TIME, field: 'A_Time' },
      P_ID: { type: DataTypes.INTEGER, allowNull: true },
      D_ID: { type: DataTypes.INTEGER, allowNull: true }
    }, {
      tableName: 'Appointment',
      timestamps: true
    });
  };
  