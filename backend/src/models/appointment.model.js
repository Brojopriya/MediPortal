export default (sequelize, DataTypes) => {
  return sequelize.define('Appointment', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'A_ID' },
    date: { type: DataTypes.DATEONLY, field: 'A_Date' },
    time: { type: DataTypes.TIME, field: 'A_Time' },
    status: {
      type: DataTypes.ENUM('SCHEDULED', 'ACCEPTED', 'REJECTED', 'COMPLETED'),
      field: 'Status',
      defaultValue: 'SCHEDULED'
    },
    P_ID: { 
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Patient', // table name
        key: 'P_ID'       // field name in Patient table
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    D_ID: { type: DataTypes.INTEGER, allowNull: true } // Doctor FK can be added similarly
  }, {
    tableName: 'Appointment',
    timestamps: true
  });
};