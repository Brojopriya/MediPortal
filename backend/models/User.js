import { Model, DataTypes } from "sequelize";

class User extends Model {
  static initModel(sequelize) {
    return User.init({
      userID: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING(100), allowNull: false },
      role: { type: DataTypes.ENUM('Admin','Doctor','Patient','Nurse','MedicalStaff'), allowNull: false },
      email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
      password: { type: DataTypes.STRING(255), allowNull: false },
      phone: { type: DataTypes.STRING(20) },
    }, { sequelize, modelName: 'User', tableName: 'User', timestamps: false });
  }
}

export default User;
