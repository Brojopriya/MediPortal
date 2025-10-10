import { Model, DataTypes } from "sequelize";

class Doctor extends Model {
  static initModel(sequelize) {
    return Doctor.init({
      drID: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      specialization: { type: DataTypes.STRING(100) },
      availableDay: { type: DataTypes.STRING(100) },
      userID: { type: DataTypes.INTEGER },
      adminID: { type: DataTypes.INTEGER },
    }, { sequelize, modelName: 'Doctor', tableName: 'Doctor', timestamps: false });
  }
}

export default Doctor;
