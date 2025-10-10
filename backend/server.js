// backend/server.js (ESM)
import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

dotenv.config();

// IMPORTANT: include .js extension for local ESM imports
import { sequelize, models } from './models/index.js';
import apptRouter from './routes/appointments.js';

const app = express();
app.use(bodyParser.json());

// mount API routes
app.use('/api/appointments', apptRouter);

// basic root
app.get('/', (req, res) => res.send('MediPortal backend is up'));

// start server and sync DB
const PORT = process.env.PORT || 4000;
async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connection OK');
    await sequelize.sync({ alter: true }); 
    console.log('Database synced');
    app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}
start();
