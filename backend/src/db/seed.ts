import { prisma } from './prisma.js';
import { memoryStore } from './memory-store.js';

export async function seedDatabase() {
  console.log('--- Starting Database Seeding ---');
  try {
    // Verify PostgreSQL connection
    await prisma.$connect();
    console.log('Connected to PostgreSQL successfully.');

    // 1. Seed Branches
    for (const b of memoryStore.branches) {
      await prisma.branch.upsert({
        where: { code: b.code },
        update: {},
        create: {
          id: b.id,
          code: b.code,
          nameEn: b.nameEn,
          nameAr: b.nameAr,
          address: b.address,
          phone: b.phone,
          colorCode: b.colorCode,
          isActive: b.isActive
        }
      });
    }
    console.log('Seeded Branches: Cairo, Alexandria, Mansoura');

    // 2. Seed Roles
    const roles = [
      { name: 'CEO' as const, desc: 'Chief Executive Officer / Company Owner' },
      { name: 'BRANCH_MANAGER' as const, desc: 'Branch Manager for authorized branch' },
      { name: 'ACCOUNTANT' as const, desc: 'Financial Accountant' },
      { name: 'INVENTORY_STAFF' as const, desc: 'Warehouse & Inventory Staff' },
      { name: 'SALES_REP' as const, desc: 'Field Sales Representative' },
      { name: 'ADMIN' as const, desc: 'System Administrator' }
    ];

    for (const r of roles) {
      await prisma.role.upsert({
        where: { name: r.name },
        update: {},
        create: {
          name: r.name,
          description: r.desc,
          permissions: []
        }
      });
    }
    console.log('Seeded Roles: CEO, Branch Manager, Accountant, Inventory, Sales Rep, Admin');

    // 3. Seed Users
    const roleRecords = await prisma.role.findMany();
    const roleMap = new Map(roleRecords.map(r => [r.name, r.id]));

    for (const u of memoryStore.users) {
      const roleId = roleMap.get(u.role);
      if (!roleId) continue;

      await prisma.user.upsert({
        where: { username: u.username },
        update: {},
        create: {
          id: u.id,
          username: u.username,
          email: u.email,
          passwordHash: u.passwordHash,
          fullName: u.fullName,
          phone: u.phone,
          roleId,
          branchId: u.branchId,
          isActive: u.isActive
        }
      });
    }
    console.log(`Seeded ${memoryStore.users.length} Users`);

    console.log('--- Database Seeding Completed Successfully ---');
  } catch (error) {
    console.warn('PostgreSQL not currently reachable or seeding in local memory mode:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  seedDatabase();
}
