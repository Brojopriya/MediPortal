// models/hospital.model.js
export default (sequelize, DataTypes) => {
    return sequelize.define('Hospital', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'H_ID' },
      name: { type: DataTypes.STRING, field: 'H_Name' },
      location: { type: DataTypes.STRING, field: 'Location' }
    }, {
      tableName: 'Hospital',
      timestamps: true
    });
  };
  