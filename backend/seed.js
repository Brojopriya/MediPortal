// seed.js

import { sequelize, models } from './db.js';


async function seed() {
  try {
    // Drop and recreate tables
    await sequelize.sync({ force: true });
    
    // Create a doctor
    const doc = await models.Doctor.create({
      name: 'Dr. Aya',
      specialty: 'Cardiology',
      email: 'draya@example.com'
    });
    
    // Create a user
    const user = await models.User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'pass123'
    });
    
    // Create an appointment for tomorrow
    await models.Appointment.create({
      patient_id: user.id,
      doctor_id: doc.id,
      datetime: new Date(Date.now() + 86400000) // +1 day
    });
    
    console.log('✅ Seed complete');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
