import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@easyrent.com';
  const password = 'Admin1234!';

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: {
      email,
    },
    update: {
      role: Role.ADMIN,
      password: hashedPassword,
    },
    create: {
      email,
      password: hashedPassword,
      name: 'Administrateur EasyRent',
      role: Role.ADMIN,
    },
  });

  console.log('Administrateur créé avec succès !');
  console.log('Email :', admin.email);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });