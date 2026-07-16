import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Deleting all transactions...');
  await prisma.transaction.deleteMany({});
  
  console.log('Resetting account balances to 0...');
  await prisma.account.updateMany({
    data: {
      balance: 0,
      totalBalance: 0,
      availableBalance: 0,
      allocatedBalance: 0,
    }
  });

  console.log('Done!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
