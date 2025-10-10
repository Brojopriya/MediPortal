import { Model, DataTypes } from "sequelize";

class Appointment extends Model {
  static initModel(sequelize) {
    return Appointment.init({
      appID: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      appDate: { type: DataTypes.DATEONLY },
      notes: { type: DataTypes.TEXT },
      appTime: { type: DataTypes.TIME },
      adminID: { type: DataTypes.INTEGER },
      drID: { type: DataTypes.INTEGER },
      paID: { type: DataTypes.INTEGER },
    }, { sequelize, modelName: 'Appointment', tableName: 'Appointment', timestamps: false });
  }
}

export default Appointment;
