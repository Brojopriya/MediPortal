// server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import bcrypt from 'bcryptjs';

// Sequelize
import { sequelize, User, Hospital } from './src/models/index.js';

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
const isRender = String(process.env.RENDER || '').toLowerCase() === 'true';
const isProduction = process.env.NODE_ENV === 'production' || isRender;

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

const DEFAULT_ADMIN_NAME = 'Brojopriya';
const DEFAULT_ADMIN_PASSWORD = 'AB12cd34@';
const DEFAULT_ADMIN_EMAIL = 'brojopriya.admin@mediportal.local';
const DEFAULT_HOSPITAL_NAME = 'MediPortal';
const DEFAULT_HOSPITAL_LOCATION = 'Main Hospital Campus';

const validateDatabaseEnv = () => {
  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

  if (!hasDatabaseUrl) {
    const required = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASS'];
    const missing = required.filter((key) => !String(process.env[key] || '').trim());

    if (missing.length) {
      throw new Error(
        `Missing database environment variables: ${missing.join(', ')}. ` +
          'Set DATABASE_URL or all DB_HOST, DB_NAME, DB_USER, DB_PASS values.'
      );
    }

    const host = String(process.env.DB_HOST || '').trim().toLowerCase();
    if (isProduction && (host === '127.0.0.1' || host === 'localhost')) {
      throw new Error(
        'Invalid DB_HOST for production: localhost/127.0.0.1. ' +
          'Use your hosted MySQL host from provider/Render environment.'
      );
    }
  }
};

const ensureDefaultHospital = async () => {
  const existingHospital = await Hospital.findOne({ where: { name: DEFAULT_HOSPITAL_NAME } });
  if (existingHospital) {
    console.log('✅ Default MediPortal hospital ensured');
    return;
  }

  await Hospital.create({
    name: DEFAULT_HOSPITAL_NAME,
    location: DEFAULT_HOSPITAL_LOCATION,
  });
  console.log('✅ Default MediPortal hospital created');
};

const ensureDefaultAdmin = async () => {
  const existingAdmin = await User.findOne({ where: { name: DEFAULT_ADMIN_NAME, role: 'ADMIN' } });
  const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);

  if (!existingAdmin) {
    await User.create({
      name: DEFAULT_ADMIN_NAME,
      email: DEFAULT_ADMIN_EMAIL,
      password: hashedPassword,
      role: 'ADMIN',
      approvalStatus: 'APPROVED',
    });
    console.log('✅ Default admin account created');
    return;
  }

  await existingAdmin.update({
    password: hashedPassword,
    role: 'ADMIN',
    approvalStatus: 'APPROVED',
  });
  console.log('✅ Default admin account ensured');
};

const startServer = async () => {
  try {
    validateDatabaseEnv();

    await sequelize.authenticate();
    console.log('✅ Database connected successfully!');

    // Sync all models (create tables if they don’t exist)
    await sequelize.sync({ alter: true }); // Safe mode: update schema without dropping data
    console.log('✅ All tables synced successfully!');

    await ensureDefaultHospital();
    await ensureDefaultAdmin();

    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (error) {
    const root = error?.original || error?.parent || error;
    console.error('❌ Database connection failed:', root?.message || error?.message || error);

    if (root?.code === 'ECONNREFUSED') {
      console.error('⚠️ Connection was refused by database host.');
      console.error('   - Do not use localhost/127.0.0.1 on Render');
      console.error('   - Set DATABASE_URL or DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASS correctly');
      console.error('   - Ensure database provider allows external connections');
    }

    if (isRender) {
      process.exit(1);
    }
  }
};

startServer();
