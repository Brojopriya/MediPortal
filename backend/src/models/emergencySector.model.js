// models/emergencySector.model.js
export default (sequelize, DataTypes) => {
    return sequelize.define('EmergencySector', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'SEC_ID' },
      name: { type: DataTypes.STRING, field: 'SEC_Name' },
      H_ID: { type: DataTypes.INTEGER, allowNull: true }
    }, {
      tableName: 'Emergency_Sector',
      timestamps: true
    });
  };
  