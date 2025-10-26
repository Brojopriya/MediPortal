// models/staffReport.model.js
export default (sequelize, DataTypes) => {
    return sequelize.define('Staff_Report', {
      S_ID: { type: DataTypes.INTEGER, primaryKey: true, field: 'S_ID' },
      R_ID: { type: DataTypes.INTEGER, primaryKey: true, field: 'R_ID' }
    }, {
      tableName: 'Staff_Report',
      timestamps: false
    });
  };
  