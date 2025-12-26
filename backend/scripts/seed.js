// Seed script for database initialization
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Starting database seed...');

    // Hash passwords
    const superAdminPassword = await bcrypt.hash('Admin@123', 10);
    const tenantAdminPassword = await bcrypt.hash('Demo@123', 10);
    const userPassword = await bcrypt.hash('User@123', 10);

    // 1. Create Super Admin User (tenant_id = null)
    const superAdmin = await prisma.user.upsert({
      where: { email: 'superadmin@system.com' },
      update: {},
      create: {
        email: 'superadmin@system.com',
        passwordHash: superAdminPassword,
        fullName: 'Super Administrator',
        role: 'super_admin',
        isActive: true,
        tenantId: null,
      },
    });
    console.log('✓ Super admin user created:', superAdmin.email);

    // 2. Create Demo Tenant
    const demoTenant = await prisma.tenant.upsert({
      where: { subdomain: 'demo' },
      update: {},
      create: {
        name: 'Demo Company',
        subdomain: 'demo',
        status: 'active',
        subscriptionPlan: 'pro',
        maxUsers: 50,
        maxProjects: 20,
      },
    });
    console.log('✓ Demo tenant created:', demoTenant.name);

    // 3. Create Tenant Admin
    const tenantAdmin = await prisma.user.upsert({
      where: { email: 'admin@demo.com' },
      update: {},
      create: {
        email: 'admin@demo.com',
        passwordHash: tenantAdminPassword,
        fullName: 'Demo Admin',
        role: 'tenant_admin',
        isActive: true,
        tenantId: demoTenant.id,
      },
    });
    console.log('✓ Tenant admin created:', tenantAdmin.email);

    // 4. Create Regular Users
    const user1 = await prisma.user.upsert({
      where: { email: 'user1@demo.com' },
      update: {},
      create: {
        email: 'user1@demo.com',
        passwordHash: userPassword,
        fullName: 'Demo User One',
        role: 'user',
        isActive: true,
        tenantId: demoTenant.id,
      },
    });
    console.log('✓ User 1 created:', user1.email);

    const user2 = await prisma.user.upsert({
      where: { email: 'user2@demo.com' },
      update: {},
      create: {
        email: 'user2@demo.com',
        passwordHash: userPassword,
        fullName: 'Demo User Two',
        role: 'user',
        isActive: true,
        tenantId: demoTenant.id,
      },
    });
    console.log('✓ User 2 created:', user2.email);

    // 5. Create Projects
    const project1 = await prisma.project.upsert({
      where: { 
        name_tenantId: {
          name: 'Project Alpha',
          tenantId: demoTenant.id,
        },
      },
      update: {},
      create: {
        name: 'Project Alpha',
        description: 'First demo project for the platform',
        status: 'active',
        tenantId: demoTenant.id,
        createdBy: tenantAdmin.id,
      },
    });
    console.log('✓ Project 1 created:', project1.name);

    const project2 = await prisma.project.upsert({
      where: { 
        name_tenantId: {
          name: 'Project Beta',
          tenantId: demoTenant.id,
        },
      },
      update: {},
      create: {
        name: 'Project Beta',
        description: 'Second demo project for testing',
        status: 'active',
        tenantId: demoTenant.id,
        createdBy: tenantAdmin.id,
      },
    });
    console.log('✓ Project 2 created:', project2.name);

    // 6. Create Tasks
    const task1 = await prisma.task.upsert({
      where: { 
        title_projectId: {
          title: 'Setup project infrastructure',
          projectId: project1.id,
        },
      },
      update: {},
      create: {
        title: 'Setup project infrastructure',
        description: 'Initialize and configure the project environment',
        status: 'in_progress',
        priority: 'high',
        tenantId: demoTenant.id,
        projectId: project1.id,
        assignedTo: user1.id,
        createdBy: tenantAdmin.id,
      },
    });
    console.log('✓ Task 1 created:', task1.title);

    const task2 = await prisma.task.upsert({
      where: { 
        title_projectId: {
          title: 'Design database schema',
          projectId: project1.id,
        },
      },
      update: {},
      create: {
        title: 'Design database schema',
        description: 'Create comprehensive database schema for the project',
        status: 'completed',
        priority: 'high',
        tenantId: demoTenant.id,
        projectId: project1.id,
        assignedTo: user2.id,
        createdBy: tenantAdmin.id,
      },
    });
    console.log('✓ Task 2 created:', task2.title);

    const task3 = await prisma.task.upsert({
      where: { 
        title_projectId: {
          title: 'Implement API endpoints',
          projectId: project2.id,
        },
      },
      update: {},
      create: {
        title: 'Implement API endpoints',
        description: 'Develop REST API endpoints for the application',
        status: 'todo',
        priority: 'medium',
        tenantId: demoTenant.id,
        projectId: project2.id,
        assignedTo: user1.id,
        createdBy: tenantAdmin.id,
      },
    });
    console.log('✓ Task 3 created:', task3.title);

    console.log('\n✅ Database seed completed successfully!');

  } catch (error) {
    console.error('❌ Error during seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
