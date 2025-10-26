// models/department.model.js
export default (sequelize, DataTypes) => {
    return sequelize.define('Department', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'Dept_ID' },
      name: { type: DataTypes.STRING, field: 'Dept_Name' },
      H_ID: { type: DataTypes.INTEGER, allowNull: true } // FK assigned in associations
    }, {
      tableName: 'Department',
      timestamps: true
    });
  };
  