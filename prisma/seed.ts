import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Récupération des identifiants depuis les variables d'environnement
  const email = process.env.ADMIN_EMAIL || 'admin@easyrent.com';
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    throw new Error('ADMIN_PASSWORD non défini dans les variables d\'environnement. Veuillez configurer .env');
  }

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