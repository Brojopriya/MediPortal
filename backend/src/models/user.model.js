export default (sequelize, DataTypes) => {
  return sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'U_ID' },
    name: { type: DataTypes.STRING, field: 'U_Name' },
    phone: { type: DataTypes.STRING, field: 'U_Phone' },
    email: { type: DataTypes.STRING, unique: true, field: 'U_Email' },
    password: { type: DataTypes.STRING, field: 'U_Password' },
    role: { type: DataTypes.STRING, field: 'U_Role', defaultValue: 'PATIENT' },
    address: { type: DataTypes.STRING, field: 'U_Address' },
    gender: { type: DataTypes.STRING, field: 'U_Gender' },
    profileUrl: { type: DataTypes.STRING, field: 'U_Profile' }
  }, {
    tableName: 'Users',
    timestamps: true
  });
};
