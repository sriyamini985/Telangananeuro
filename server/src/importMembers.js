import fs from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';
import prisma from './db.js';

dotenv.config();

const inputPath = process.argv[2] || path.resolve('data/members.json');

try {
  const raw = await fs.readFile(inputPath, 'utf8');
  const records = JSON.parse(raw);

  if (!Array.isArray(records) || records.length === 0) {
    console.error('JSON file must contain a non-empty array of member objects.');
    process.exit(1);
  }

  let count = 0;
  for (const row of records) {
    const membershipNo = String(row.membershipNo || '').trim();
    const name = String(row.name || '').trim();
    if (!membershipNo || !name) continue;

    await prisma.memberDirectory.upsert({
      where: { membershipNo },
      update: {
        name,
        email: row.email ? String(row.email).toLowerCase().trim() : null,
        phone: row.phone ? String(row.phone).trim() : null,
        category: row.category ? String(row.category).trim() : null,
        specialty: row.specialty ? String(row.specialty).trim() : null,
        city: row.city ? String(row.city).trim() : null,
      },
      create: {
        membershipNo,
        name,
        email: row.email ? String(row.email).toLowerCase().trim() : null,
        phone: row.phone ? String(row.phone).trim() : null,
        category: row.category ? String(row.category).trim() : null,
        specialty: row.specialty ? String(row.specialty).trim() : null,
        city: row.city ? String(row.city).trim() : null,
      },
    });
    count++;
  }

  console.log(`Imported/updated ${count} member directory records from ${inputPath}`);
} finally {
  await prisma.$disconnect();
}
