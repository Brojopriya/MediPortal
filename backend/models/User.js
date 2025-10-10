// models/User.js
import { DataTypes, Model } from 'sequelize';

class User extends Model {
  static initModel(sequelize) {
    User.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
          validate: {
            isEmail: true,
          },
        },
        password: {
          type: DataTypes.STRING,
          allowNull: false,
          // ⚠️ Remember to hash passwords before saving
        },
        role: {
          type: DataTypes.ENUM('PATIENT', 'DOCTOR', 'STAFF', 'ADMIN'),
          allowNull: false,
          defaultValue: 'PATIENT',
        },
        isApproved: {
          type: DataTypes.BOOLEAN,
          defaultValue: false, // Patients may be auto-approved in controller
        },
      },
      {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        timestamps: true,
        underscored: true,
      }
    );

    return User;
  }
}

export default User;
