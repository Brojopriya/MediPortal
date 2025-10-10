import { Model, DataTypes } from "sequelize";

class Patient extends Model {
  static initModel(sequelize) {
    return Patient.init({
      paID: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      address: { type: DataTypes.STRING(255) },
      medicalHistory: { type: DataTypes.TEXT },
      bloodGroup: { type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-') },
      gender: { type: DataTypes.ENUM('Male', 'Female') },
      age: { type: DataTypes.INTEGER },
      userID: { type: DataTypes.INTEGER },
      adminID: { type: DataTypes.INTEGER },
    }, { sequelize, modelName: 'Patient', tableName: 'Patient', timestamps: false });
  }
}

export default Patient;
