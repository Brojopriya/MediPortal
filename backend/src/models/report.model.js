// models/report.model.js
export default (sequelize, DataTypes) => {
    return sequelize.define('Report', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'R_ID' },
      date: { type: DataTypes.DATEONLY, field: 'R_Date' },
      Test_ID: { type: DataTypes.INTEGER, allowNull: true },
      S_ID: { type: DataTypes.INTEGER, allowNull: true },
      P_ID: { type: DataTypes.INTEGER, allowNull: true }
    }, {
      tableName: 'Report',
      timestamps: true
    });
  };
  