// seed.js
import { sequelize, models } from './db.js';

async function seed() {
  try {
    console.log('🔄 Syncing database...');
    await sequelize.sync({ force: true }); // Drops and recreates all tables

    // Create a doctor user
    const doctorUser = await models.User.create({
      name: 'Dr. Aya',
      email: 'draya@example.com',
      password: 'pass123',  // ideally hash this in real app
      role: 'DOCTOR'
    });

    // Create a doctor profile linked to that user
    const doctor = await models.Doctor.create({
      user_id: doctorUser.id,
      specialty: 'Cardiology',
      phone: '01700000000'
    });

    // Create a patient user
    const patientUser = await models.User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'pass123',
      role: 'PATIENT'
    });

    // Create an appointment (for tomorrow)
    await models.Appointment.create({
      patient_id: patientUser.id,
      doctor_id: doctor.id,
      datetime: new Date(Date.now() + 86400000), // +1 day
      status: 'PENDING'
    });

    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error while seeding:', err);
    process.exit(1);
  }
}

seed();

