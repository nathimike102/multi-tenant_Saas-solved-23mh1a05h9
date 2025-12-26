const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Clear existing data (in reverse order of dependencies)
  await prisma.auditLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();

  console.log('Cleared existing data');

  // Hash passwords
  const superAdminPassword = await bcrypt.hash('Admin@123', 10);
  const demoAdminPassword = await bcrypt.hash('Demo@123', 10);
  const userPassword = await bcrypt.hash('User@123', 10);

  // ============================================
  // 1. CREATE SUPER ADMIN ACCOUNT
  // ============================================
  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@system.com',
      passwordHash: superAdminPassword,
      fullName: 'Super Administrator',
      role: 'super_admin',
      isActive: true,
      tenantId: null, // Not associated with any tenant
    },
  });
  console.log('✓ Created Super Admin account');

  // ============================================
  // 2. CREATE SAMPLE TENANT (Demo Company)
  // ============================================
  const demoTenant = await prisma.tenant.create({
    data: {
      name: 'Demo Company',
      subdomain: 'demo',
      status: 'active',
      subscriptionPlan: 'pro',
      maxUsers: 50,
      maxProjects: 100,
    },
  });
  console.log('✓ Created Demo Company tenant');

  // ============================================
  // 3. CREATE TENANT ADMIN FOR DEMO COMPANY
  // ============================================
  const demoAdmin = await prisma.user.create({
    data: {
      tenantId: demoTenant.id,
      email: 'admin@demo.com',
      passwordHash: demoAdminPassword,
      fullName: 'Demo Admin',
      role: 'tenant_admin',
      isActive: true,
    },
  });
  console.log('✓ Created Tenant Admin for Demo Company');

  // ============================================
  // 4. CREATE 2 REGULAR USERS FOR DEMO COMPANY
  // ============================================
  const user1 = await prisma.user.create({
    data: {
      tenantId: demoTenant.id,
      email: 'user1@demo.com',
      passwordHash: userPassword,
      fullName: 'John Doe',
      role: 'user',
      isActive: true,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      tenantId: demoTenant.id,
      email: 'user2@demo.com',
      passwordHash: userPassword,
      fullName: 'Jane Smith',
      role: 'user',
      isActive: true,
    },
  });
  console.log('✓ Created 2 regular users for Demo Company');

  // ============================================
  // 5. CREATE 2 SAMPLE PROJECTS
  // ============================================
  const project1 = await prisma.project.create({
    data: {
      tenantId: demoTenant.id,
      name: 'Website Redesign',
      description: 'Complete redesign of the company website with modern UI/UX',
      status: 'active',
      createdBy: demoAdmin.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      tenantId: demoTenant.id,
      name: 'Mobile App Development',
      description: 'Develop a mobile app for iOS and Android platforms',
      status: 'active',
      createdBy: demoAdmin.id,
    },
  });
  console.log('✓ Created 2 sample projects');

  // ============================================
  // 6. CREATE 5 SAMPLE TASKS
  // ============================================
  await prisma.task.createMany({
    data: [
      {
        projectId: project1.id,
        tenantId: demoTenant.id,
        title: 'Create wireframes for homepage',
        description: 'Design wireframes for the new homepage layout',
        status: 'completed',
        priority: 'high',
        assignedTo: user1.id,
        dueDate: new Date('2025-01-15'),
      },
      {
        projectId: project1.id,
        tenantId: demoTenant.id,
        title: 'Develop responsive navigation',
        description: 'Implement a mobile-responsive navigation menu',
        status: 'in_progress',
        priority: 'high',
        assignedTo: user1.id,
        dueDate: new Date('2025-01-20'),
      },
      {
        projectId: project1.id,
        tenantId: demoTenant.id,
        title: 'Setup analytics tracking',
        description: 'Integrate Google Analytics and setup conversion tracking',
        status: 'todo',
        priority: 'medium',
        assignedTo: user2.id,
        dueDate: new Date('2025-01-25'),
      },
      {
        projectId: project2.id,
        tenantId: demoTenant.id,
        title: 'Design app login screen',
        description: 'Create UI design for the mobile app login screen',
        status: 'in_progress',
        priority: 'high',
        assignedTo: user2.id,
        dueDate: new Date('2025-01-18'),
      },
      {
        projectId: project2.id,
        tenantId: demoTenant.id,
        title: 'Setup push notifications',
        description: 'Implement push notification system for both iOS and Android',
        status: 'todo',
        priority: 'low',
        assignedTo: null, // Unassigned
        dueDate: new Date('2025-02-01'),
      },
    ],
  });
  console.log('✓ Created 5 sample tasks');

  // ============================================
  // 7. CREATE AUDIT LOG ENTRIES
  // ============================================
  await prisma.auditLog.createMany({
    data: [
      {
        tenantId: demoTenant.id,
        userId: demoAdmin.id,
        action: 'CREATE_PROJECT',
        entityType: 'project',
        entityId: project1.id,
        ipAddress: '127.0.0.1',
      },
      {
        tenantId: demoTenant.id,
        userId: demoAdmin.id,
        action: 'CREATE_PROJECT',
        entityType: 'project',
        entityId: project2.id,
        ipAddress: '127.0.0.1',
      },
      {
        tenantId: null,
        userId: superAdmin.id,
        action: 'CREATE_TENANT',
        entityType: 'tenant',
        entityId: demoTenant.id,
        ipAddress: '127.0.0.1',
      },
    ],
  });
  console.log('✓ Created audit log entries');

  console.log('\n✅ Database seeding completed successfully!\n');
  console.log('========================================');
  console.log('SEED DATA SUMMARY');
  console.log('========================================');
  console.log('\n📧 Super Admin Account:');
  console.log('   Email: superadmin@system.com');
  console.log('   Password: Admin@123');
  console.log('   Role: super_admin');
  console.log('\n🏢 Demo Company Tenant:');
  console.log('   Subdomain: demo');
  console.log('   Plan: pro');
  console.log('\n👤 Tenant Admin:');
  console.log('   Email: admin@demo.com');
  console.log('   Password: Demo@123');
  console.log('   Role: tenant_admin');
  console.log('\n👥 Regular Users:');
  console.log('   User 1: user1@demo.com / User@123');
  console.log('   User 2: user2@demo.com / User@123');
  console.log('\n📊 Projects: 2');
  console.log('   - Website Redesign');
  console.log('   - Mobile App Development');
  console.log('\n✅ Tasks: 5 (distributed across projects)');
  console.log('========================================\n');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
