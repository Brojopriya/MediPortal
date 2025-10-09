// models/User.js
import { DataTypes, Model } from 'sequelize';

class User extends Model {
  static initModel(sequelize) {
    User.init({
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      password: { type: DataTypes.STRING, allowNull: false }, // store hashed
      role: { type: DataTypes.ENUM('PATIENT','DOCTOR','ADMIN'), defaultValue: 'PATIENT' }
    }, { 
      sequelize, 
      modelName: 'user', 
      tableName: 'users' 
    });
    return User;
  }
}

export default User;
