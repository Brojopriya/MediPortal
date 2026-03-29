// src/config/db.js
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

let sequelize;
const connectionUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;

if (connectionUrl) {
  // ✅ Railway (production)
  sequelize = new Sequelize(connectionUrl, {
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: false,
  });
} else {
  // ✅ Local (development)
  const dbPort = Number(process.env.DB_PORT || 3306);

  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST,
      port: Number.isFinite(dbPort) ? dbPort : 3306,
      dialect: 'mysql',
      logging: false,
    }
  );
}

export default sequelize;