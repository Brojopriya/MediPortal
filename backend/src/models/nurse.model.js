// models/nurse.model.js
export default (sequelize, DataTypes) => {
    return sequelize.define('Nurse', {
      id: { type: DataTypes.INTEGER, primaryKey: true, field: 'N_ID' },
      post: { type: DataTypes.STRING, field: 'N_Post' },
      department: { type: DataTypes.STRING, field: 'Department' },
      timeSchedule: { type: DataTypes.STRING, field: 'Time_Schedule' },
      W_ID: { type: DataTypes.INTEGER, allowNull: true }
    }, {
      tableName: 'Nurse',
      timestamps: true
    });
  };
  