// models/Doctor.js
import { DataTypes, Model } from 'sequelize';

class Doctor extends Model {
  static initModel(sequelize) {
    Doctor.init({
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING, allowNull: false },
      specialty: { type: DataTypes.STRING },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      phone: { type: DataTypes.STRING }
    }, { 
      sequelize, 
      modelName: 'doctor', 
      tableName: 'doctors' 
    });
    return Doctor;
  }
}

export default Doctor;
