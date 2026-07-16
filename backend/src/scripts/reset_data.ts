import * as dotenv from 'dotenv';
dotenv.config();

import { prisma } from '../shared/db/prisma.js';

async function main() {
  console.log("Deleting all transactions...");
  await prisma.transaction.deleteMany({});
  
  console.log("Resetting all account balances to 0...");
  await prisma.account.updateMany({
    data: { 
      balance: 0,
      totalBalance: 0,
      availableBalance: 0,
      allocatedBalance: 0
    }
  });
  
  console.log("Done! You can now import a fresh file.");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
