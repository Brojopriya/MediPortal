// models/feedback.model.js
export default (sequelize, DataTypes) => {
  return sequelize.define(
    'Feedback',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'F_ID' },
      category: {
        type: DataTypes.ENUM('GENERAL', 'UI_UX', 'PERFORMANCE', 'BUG', 'FEATURE'),
        allowNull: false,
        defaultValue: 'GENERAL',
        field: 'Category',
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 5,
        field: 'Rating',
        validate: {
          min: 1,
          max: 5,
        },
      },
      message: {
        type: DataTypes.TEXT('long'),
        allowNull: false,
        field: 'Message',
      },
      P_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: 'Feedback',
      timestamps: true,
    }
  );
};
