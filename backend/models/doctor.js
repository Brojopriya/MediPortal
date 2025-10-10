// models/Doctor.js
import { DataTypes, Model } from 'sequelize';

class Doctor extends Model {
  static initModel(sequelize) {
    Doctor.init({
      id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
      },
      user_id: { 
        type: DataTypes.INTEGER, 
        allowNull: false, 
        references: { model: 'users', key: 'id' } 
      },
      specialty: { 
        type: DataTypes.STRING, 
        allowNull: true 
      },
      phone: { 
        type: DataTypes.STRING, 
        allowNull: true 
      }
    }, { 
      sequelize, 
      modelName: 'doctor', 
      tableName: 'doctors' 
    });

    return Doctor;
  }
}

export default Doctor;
