import { Model, DataTypes } from "sequelize";
import User from "./User.js";

class Admin extends Model {
  static initModel(sequelize) {
    return Admin.init({
      adminID: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      designation: { type: DataTypes.STRING(100) },
      userID: { type: DataTypes.INTEGER },
    }, { sequelize, modelName: 'Admin', tableName: 'Admin', timestamps: false });
  }
}

export default Admin;
