// models/telemedicine.model.js
export default (sequelize, DataTypes) => {
    return sequelize.define('Telemedicine', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'Tm_ID' },
      prescription: { type: DataTypes.STRING, field: 'Prescription' },
      media: { type: DataTypes.STRING, field: 'Media' },
      date: { type: DataTypes.DATEONLY, field: 'Tm_Date' },
      requestedTime: { type: DataTypes.STRING, field: 'Requested_Time', allowNull: true },
      requestStatus: {
        type: DataTypes.STRING,
        field: 'Request_Status',
        allowNull: false,
        defaultValue: 'PAYMENT_SUBMITTED',
      },
      paymentMethod: { type: DataTypes.STRING, field: 'Payment_Method', allowNull: true },
      paymentNumber: { type: DataTypes.STRING, field: 'Payment_Number', allowNull: true },
      transactionId: { type: DataTypes.STRING, field: 'Transaction_ID', allowNull: true },
      paymentStatus: {
        type: DataTypes.STRING,
        field: 'Payment_Status',
        allowNull: false,
        defaultValue: 'PENDING',
      },
      staffReviewNote: { type: DataTypes.STRING, field: 'Staff_Review_Note', allowNull: true },
      D_ID: { type: DataTypes.INTEGER, allowNull: true },
      P_ID: { type: DataTypes.INTEGER, allowNull: true },
      S_ID: { type: DataTypes.INTEGER, allowNull: true }
    }, {
      tableName: 'Telemedicine',
      timestamps: true
    });
  };
  