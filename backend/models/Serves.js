import { Model, DataTypes } from "sequelize";

class Serves extends Model {
  static initModel(sequelize) {
    return Serves.init({
      nurseID: { type: DataTypes.INTEGER, primaryKey: true },
      paID: { type: DataTypes.INTEGER, primaryKey: true },
    }, { sequelize, modelName: 'Serves', tableName: 'Serves', timestamps: false });
  }
}

export default Serves;
