// models/diagnosis.model.js
export default (sequelize, DataTypes) => {
    return sequelize.define('Diagnosis', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'Test_ID' },
      name: { type: DataTypes.STRING, field: 'Test_Name' },
      price: { type: DataTypes.DECIMAL(10,2), field: 'Test_Price' },
      P_ID: { type: DataTypes.INTEGER, allowNull: true }
    }, {
      tableName: 'Diagnosis',
      timestamps: true
    });
  };
  