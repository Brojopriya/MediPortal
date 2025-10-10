import { Model, DataTypes } from "sequelize";

class Prescription extends Model {
  static initModel(sequelize) {
    return Prescription.init({
      prID: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      datePrescribed: { type: DataTypes.DATEONLY },
      medName: { type: DataTypes.STRING(100) },
      dosage: { type: DataTypes.STRING(100) },
      drID: { type: DataTypes.INTEGER },
      paID: { type: DataTypes.INTEGER },
    }, { sequelize, modelName: 'Prescription', tableName: 'Prescription', timestamps: false });
  }
}

export default Prescription;
