import { Model, DataTypes } from "sequelize";

class Telemedicine extends Model {
  static initModel(sequelize) {
    return Telemedicine.init({
      sessionID: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      sessionNotes: { type: DataTypes.TEXT },
      videoLink: { type: DataTypes.STRING(255) },
      startTime: { type: DataTypes.DATE },
      endTime: { type: DataTypes.DATE },
      userID: { type: DataTypes.INTEGER },
      adminID: { type: DataTypes.INTEGER },
      appID: { type: DataTypes.INTEGER },
      drID: { type: DataTypes.INTEGER },
      paID: { type: DataTypes.INTEGER },
    }, { sequelize, modelName: 'Telemedicine', tableName: 'Telemedicine', timestamps: false });
  }
}

export default Telemedicine;
