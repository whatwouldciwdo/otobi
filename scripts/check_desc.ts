import 'dotenv/config';
import prisma from '../lib/prisma';

async function main() {
  const products = await prisma.product.findMany();
  for (const product of products) {
    if (product.title.toLowerCase().includes('rat')) {
      console.log(product.title);
      console.log(JSON.stringify(product.description));
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
