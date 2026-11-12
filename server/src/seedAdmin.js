import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import prisma from './db.js';

dotenv.config();

const username = process.env.ADMIN_USERNAME || 'admin';
const password = process.env.ADMIN_PASSWORD || process.argv[2];

if (!password || password.length < 4) {
  console.error(
    'Provide ADMIN_PASSWORD in .env or pass it cleanly as an argument (min 4 chars): node src/seedAdmin.js "YourPassword"'
  );
  process.exit(1);
}

try {
  const passwordHash = await bcrypt.hash(password, 10);
  const admin = await prisma.admin.upsert({
    where: { username },
    update: { passwordHash },
    create: { username, passwordHash, role: 'Admin' },
  });
  console.log(`Admin account ready: ${admin.username} (role: ${admin.role})`);
} finally {
  await prisma.$disconnect();
}
