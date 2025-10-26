// models/telemedicine.model.js
export default (sequelize, DataTypes) => {
    return sequelize.define('Telemedicine', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'Tm_ID' },
      prescription: { type: DataTypes.STRING, field: 'Prescription' },
      media: { type: DataTypes.STRING, field: 'Media' },
      date: { type: DataTypes.DATEONLY, field: 'Tm_Date' },
      D_ID: { type: DataTypes.INTEGER, allowNull: true },
      P_ID: { type: DataTypes.INTEGER, allowNull: true }
    }, {
      tableName: 'Telemedicine',
      timestamps: true
    });
  };
  