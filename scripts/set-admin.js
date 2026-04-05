const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const adminUsername = process.argv[2] || 'tuanthanh146';
  
  const user = await prisma.user.update({
    where: { username: adminUsername },
    data: { role: 'ADMIN' }
  });

  console.log(`✅ Success! Phân quyền cấp ADMIN cho tài khoản: ${user.username}`);
}

main()
  .catch(e => {
    console.error("Lỗi:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
