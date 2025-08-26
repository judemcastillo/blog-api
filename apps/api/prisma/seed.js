import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'author@example.com';
  const password = await bcrypt.hash('password123', 10);

  const exists = await prisma.user.findUnique({ where: { email } });
  if (!exists) {
    await prisma.user.create({
      data: { email, username: 'author', password, role: 'AUTHOR' }
    });
    console.log('Seeded author@example.com / password123');
  } else {
    console.log('Author already exists');
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect());
