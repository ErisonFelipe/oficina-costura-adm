import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';
import { randomBytes } from 'node:crypto';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

/**
 * Gera uma senha forte aleatória (16 caracteres).
 */
function generateStrongPassword(): string {
  return randomBytes(12)
    .toString('base64')
    .replace(/[+/=]/g, '')
    .slice(0, 16);
}

async function main() {
  const args = process.argv.slice(2);
  const email = args[0] || 'admin@oficina.local';
  const newPassword = args[1] || generateStrongPassword();

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.error(`❌ Usuário ${email} não encontrado`);
    process.exit(1);
  }

  const hash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { email },
    data: { password: hash },
  });

  console.log('');
  console.log('✅ Senha alterada com sucesso!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   E-mail: ${email}`);
  console.log(`   Nova senha: ${newPassword}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('⚠️  Guarde esta senha em local seguro!');
  console.log('   Ela NÃO será mostrada novamente.');
  console.log('');
}

main()
  .catch((err) => {
    console.error('❌ Erro:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
