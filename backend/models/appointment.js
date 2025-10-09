// models/Appointment.js
import { DataTypes, Model } from 'sequelize';

class Appointment extends Model {
  static initModel(sequelize) {
    Appointment.init({
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      patient_id: { type: DataTypes.INTEGER, allowNull: false },
      doctor_id: { type: DataTypes.INTEGER, allowNull: false },
      datetime: { type: DataTypes.DATE, allowNull: false },
      status: { type: DataTypes.ENUM('PENDING','CONFIRMED','CANCELLED','COMPLETED'), defaultValue: 'PENDING' },
      notes: { type: DataTypes.TEXT, allowNull: true }
    }, { 
      sequelize, 
      modelName: 'appointment', 
      tableName: 'appointments' 
    });
    return Appointment;
  }
}

export default Appointment;
