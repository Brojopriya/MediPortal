import { Model, DataTypes } from "sequelize";

class Nurse extends Model {
  static initModel(sequelize) {
    return Nurse.init({
      nurseID: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      userID: { type: DataTypes.INTEGER },
      adminID: { type: DataTypes.INTEGER },
    }, { sequelize, modelName: 'Nurse', tableName: 'Nurse', timestamps: false });
  }
}

export default Nurse;
