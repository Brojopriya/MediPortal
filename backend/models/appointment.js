// models/Appointment.js
import { DataTypes, Model } from 'sequelize';

class Appointment extends Model {
  static initModel(sequelize) {
    Appointment.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        patient_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'users', key: 'id' }
        },
        doctor_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'doctors', key: 'id' }
        },
        datetime: {
          type: DataTypes.DATE,
          allowNull: false
        },
        status: {
          type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'),
          defaultValue: 'PENDING',
          allowNull: false
        },
        notes: {
          type: DataTypes.TEXT,
          allowNull: true
        }
      },
      {
        sequelize,
        modelName: 'Appointment',
        tableName: 'appointments',
        timestamps: true,
        underscored: true,
        indexes: [
          { fields: ['doctor_id', 'datetime'] },
          { fields: ['patient_id'] }
        ]
      }
    );

    return Appointment;
  }
}

export default Appointment;
