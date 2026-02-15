import { User, sequelize } from '../src/models/index.js';

async function find() {
  try {
    await sequelize.authenticate();
    const email = process.argv[2];
    if (!email) {
      console.error('Usage: node scripts/findUser.js <email>');
      process.exit(1);
    }
    const user = await User.findOne({ where: { email: email.trim().toLowerCase() } });
    if (!user) {
      console.log('NOT FOUND');
      process.exit(0);
    }
    console.log('FOUND:', user.toJSON());
    process.exit(0);
  } catch (err) {
    console.error('ERROR:', err);
    process.exit(2);
  }
}

find();
