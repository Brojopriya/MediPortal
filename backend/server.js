// server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';

// Sequelize
import { sequelize } from './src/models/index.js';

// Routes
import userRoutes from './src/routes/userRoutes.js';
import doctorRoutes from './src/routes/doctorRoutes.js';
import patientRoutes from './src/routes/patientRoutes.js';
import nurseRoutes from './src/routes/nurseRoutes.js';
import medicalstaffRoutes from './src/routes/medicalstaffRoutes.js';
import appointmentRoutes from './src/routes/appointmentRoutes.js';
import reportRoutes from './src/routes/reportRoutes.js';
import telemedicineRoutes from './src/routes/telemedicineRoutes.js';
import statsRoutes from './src/routes/statsRoutes.js';
import hospitalRoutes from './src/routes/hospitalRoutes.js';
import { forgotPassword } from './src/controllers/userController.js';

// Middleware
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();
const app = express();

// ✅ CORS setup
const configuredOrigins = (process.env.CORS_ORIGINS || "http://localhost:3000,http://localhost:3001")
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const isAllowedDevOrigin = (origin) =>
  /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (configuredOrigins.includes(origin) || isAllowedDevOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));

// ✅ Middleware
// Allow larger payloads because profile photos are currently sent as base64 data URLs.
app.use(bodyParser.json({ limit: '12mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '12mb' }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/nurses', nurseRoutes);
app.use('/api/medicalstaff', medicalstaffRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/telemedicine', telemedicineRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.post('/api/forgot-password', forgotPassword);

// ✅ 404 Middleware (catch-all for unknown routes)
app.use((req, res, next) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ✅ Error Handling Middleware
app.use(errorHandler);

// Start server and sync database
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully!');

    // Sync all models (create tables if they don’t exist)
    await sequelize.sync({ alter: true }); // Safe mode: update schema without dropping data
    console.log('✅ All tables synced successfully!');

    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
};

startServer();
