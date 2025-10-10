import { Model, DataTypes } from "sequelize";

class Treats extends Model {
  static initModel(sequelize) {
    return Treats.init({
      drID: { type: DataTypes.INTEGER, primaryKey: true },
      paID: { type: DataTypes.INTEGER, primaryKey: true },
    }, { sequelize, modelName: 'Treats', tableName: 'Treats', timestamps: false });
  }
}

export default Treats;
