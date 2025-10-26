// models/ward.model.js
export default (sequelize, DataTypes) => {
    return sequelize.define('Ward', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'W_ID' },
      capacity: { type: DataTypes.INTEGER, field: 'Capacity' },
      Dept_ID: { type: DataTypes.INTEGER, allowNull: true }
    }, {
      tableName: 'Ward',
      timestamps: true
    });
  };
  