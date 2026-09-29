import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = 'admin@oficina.local';
  // Senha forte vinda de variável de ambiente (com fallback só para dev)
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'admin123';

  const existing = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existing) {
    console.log(`⚠️  Usuário ${adminEmail} já existe. Pulando seed.`);
    return;
  }

  const hash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Administrador',
      email: adminEmail,
      password: hash,
      role: 'ADMIN',
      active: true,
    },
  });

  console.log('✅ Usuário admin criado com sucesso!');
  console.log('   E-mail:', admin.email);
  console.log('   Senha: ', adminPassword);
  console.log('   ⚠️  Troque esta senha depois do primeiro login!');
  console.log('   💡 Use: npm run change-password admin@oficina.local');
}

main()
  .catch((err) => {
    console.error('❌ Erro no seed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
