// server.js
const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const { sequelize, models } = require('./models'); // loads models & associations
const apptRouter = require('./routes/appointments');

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
    // In development it's OK; in production prefer migrations.
    await sequelize.sync({ alter: true }); 
    console.log('Database synced');
    app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}
start();
