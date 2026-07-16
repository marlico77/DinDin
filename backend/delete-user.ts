import { prisma, disconnectDatabase } from './src/shared/db/prisma.js';


async function main() {
  const email = 'marlonssoficial@gmail.com';
  
  // Find the user
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (user) {
    console.log(`Found user: ${user.id}. Deleting...`);
    await prisma.user.delete({
      where: { email }
    });
    console.log('User deleted successfully.');
  } else {
    console.log('User not found.');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await disconnectDatabase();
  });
