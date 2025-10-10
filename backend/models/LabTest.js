import { Model, DataTypes } from "sequelize";

class LabTest extends Model {
  static initModel(sequelize) {
    return LabTest.init({
      testID: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      testDate: { type: DataTypes.DATEONLY },
      testName: { type: DataTypes.STRING(100) },
      status: { type: DataTypes.ENUM('Pending', 'Completed', 'Cancelled') },
      result: { type: DataTypes.TEXT },
      drID: { type: DataTypes.INTEGER },
      paID: { type: DataTypes.INTEGER },
      staffID: { type: DataTypes.INTEGER },
    }, { sequelize, modelName: 'LabTest', tableName: 'LabTest', timestamps: false });
  }
}

export default LabTest;
