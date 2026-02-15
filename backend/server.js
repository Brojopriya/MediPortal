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
import appointmentRoutes from './src/routes/appointmentRoutes.js';
import reportRoutes from './src/routes/reportRoutes.js';
import telemedicineRoutes from './src/routes/telemedicineRoutes.js';

// Middleware
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();
const app = express();

// ✅ CORS setup
const corsOptions = {
  origin: "http://localhost:3000", // React frontend URL
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));

// ✅ Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/nurses', nurseRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/telemedicine', telemedicineRoutes);

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
    await sequelize.sync({ alter: true }); // { force: true } resets tables
    console.log('✅ All tables synced successfully!');

    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
};

startServer();
