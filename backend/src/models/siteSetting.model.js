export default (sequelize, DataTypes) => {
  return sequelize.define('SiteSetting', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    key: { type: DataTypes.STRING, unique: true, allowNull: false },
    value: { type: DataTypes.TEXT('long'), allowNull: false }
  }, {
    tableName: 'SiteSettings',
    timestamps: true
  });
};
