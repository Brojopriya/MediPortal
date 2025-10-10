import { Model, DataTypes } from "sequelize";

class MedicalStaff extends Model {
  static initModel(sequelize) {
    return MedicalStaff.init({
      staffID: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      userID: { type: DataTypes.INTEGER },
      adminID: { type: DataTypes.INTEGER },
    }, { sequelize, modelName: 'MedicalStaff', tableName: 'MedicalStaff', timestamps: false });
  }
}

export default MedicalStaff;
