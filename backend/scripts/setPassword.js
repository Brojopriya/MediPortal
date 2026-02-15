import bcrypt from 'bcryptjs';
import { sequelize, User } from '../src/models/index.js';

async function setPassword() {
  const email = process.argv[2];
  const password = process.argv[3];
  if (!email || !password) {
    console.error('Usage: node scripts/setPassword.js <email> <newPassword>');
    process.exit(1);
  }

  try {
    await sequelize.authenticate();
    const user = await User.findOne({ where: { email: email.trim().toLowerCase() } });
    if (!user) {
      console.error('User not found:', email);
      process.exit(2);
    }

    const hashed = await bcrypt.hash(password, 10);
    await User.update({ password: hashed }, { where: { id: user.id } });
    console.log('Password updated for', email);
    process.exit(0);
  } catch (err) {
    console.error('ERROR:', err);
    process.exit(3);
  }
}

setPassword();
