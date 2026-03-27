import { sequelize, Hospital } from '../src/models/index.js';

const createHospital = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    const existing = await Hospital.findOne({ where: { name: 'MediPortal' } });
    if (existing) {
      console.log('✅ MediPortal hospital already exists:', {
        id: existing.id,
        name: existing.name,
        location: existing.location,
      });
      return;
    }

    const hospital = await Hospital.create({
      name: 'MediPortal',
      location: 'Main Hospital Campus',
    });

    console.log('✅ MediPortal hospital created successfully:');
    console.log({
      id: hospital.id,
      name: hospital.name,
      location: hospital.location,
      createdAt: hospital.createdAt,
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
};

createHospital();
