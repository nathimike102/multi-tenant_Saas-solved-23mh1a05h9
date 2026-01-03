// Prisma seed file - runs automatically after migrations
require('dotenv').config();
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
    let superAdmin = await prisma.user.findFirst({
      where: { email: 'superadmin@system.com' },
    });
    if (!superAdmin) {
      superAdmin = await prisma.user.create({
        data: {
          email: 'superadmin@system.com',
          passwordHash: superAdminPassword,
          fullName: 'Super Administrator',
          role: 'super_admin',
          isActive: true,
          tenantId: null,
        },
      });
    }
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
    let tenantAdmin = await prisma.user.findFirst({
      where: { email: 'admin@demo.com', tenantId: demoTenant.id },
    });
    if (!tenantAdmin) {
      tenantAdmin = await prisma.user.create({
        data: {
          email: 'admin@demo.com',
          passwordHash: tenantAdminPassword,
          fullName: 'Demo Admin',
          role: 'tenant_admin',
          isActive: true,
          tenantId: demoTenant.id,
        },
      });
    }
    console.log('✓ Tenant admin created:', tenantAdmin.email);

    // 4. Create Regular Users
    let user1 = await prisma.user.findFirst({
      where: { email: 'user1@demo.com', tenantId: demoTenant.id },
    });
    if (!user1) {
      user1 = await prisma.user.create({
        data: {
          email: 'user1@demo.com',
          passwordHash: userPassword,
          fullName: 'Demo User One',
          role: 'user',
          isActive: true,
          tenantId: demoTenant.id,
        },
      });
    }
    console.log('✓ User 1 created:', user1.email);

    let user2 = await prisma.user.findFirst({
      where: { email: 'user2@demo.com', tenantId: demoTenant.id },
    });
    if (!user2) {
      user2 = await prisma.user.create({
        data: {
          email: 'user2@demo.com',
          passwordHash: userPassword,
          fullName: 'Demo User Two',
          role: 'user',
          isActive: true,
          tenantId: demoTenant.id,
        },
      });
    }
    console.log('✓ User 2 created:', user2.email);

    // 5. Create Projects
    let project1 = await prisma.project.findFirst({
      where: { name: 'Project Alpha', tenantId: demoTenant.id },
    });
    if (!project1) {
      project1 = await prisma.project.create({
        data: {
          name: 'Project Alpha',
          description: 'First demo project for the platform',
          status: 'active',
          tenantId: demoTenant.id,
          createdBy: tenantAdmin.id,
        },
      });
    }
    console.log('✓ Project 1 created:', project1.name);

    let project2 = await prisma.project.findFirst({
      where: { name: 'Project Beta', tenantId: demoTenant.id },
    });
    if (!project2) {
      project2 = await prisma.project.create({
        data: {
          name: 'Project Beta',
          description: 'Second demo project for testing',
          status: 'active',
          tenantId: demoTenant.id,
          createdBy: tenantAdmin.id,
        },
      });
    }
    console.log('✓ Project 2 created:', project2.name);

    // 6. Create Tasks (without createdBy as it's not in DB migration)
    let task1 = await prisma.task.findFirst({
      where: { title: 'Setup project infrastructure', projectId: project1.id },
    });
    if (!task1) {
      task1 = await prisma.task.create({
        data: {
          title: 'Setup project infrastructure',
          description: 'Initialize and configure the project environment',
          status: 'in_progress',
          priority: 'high',
          tenantId: demoTenant.id,
          projectId: project1.id,
          assignedTo: user1.id,
        },
      });
    }
    console.log('✓ Task 1 created:', task1.title);

    let task2 = await prisma.task.findFirst({
      where: { title: 'Design database schema', projectId: project1.id },
    });
    if (!task2) {
      task2 = await prisma.task.create({
        data: {
          title: 'Design database schema',
          description: 'Create comprehensive database schema for the project',
          status: 'completed',
          priority: 'high',
          tenantId: demoTenant.id,
          projectId: project1.id,
          assignedTo: user2.id,
        },
      });
    }
    console.log('✓ Task 2 created:', task2.title);

    let task3 = await prisma.task.findFirst({
      where: { title: 'Implement API endpoints', projectId: project2.id },
    });
    if (!task3) {
      task3 = await prisma.task.create({
        data: {
          title: 'Implement API endpoints',
          description: 'Develop REST API endpoints for the application',
          status: 'todo',
          priority: 'medium',
          tenantId: demoTenant.id,
          projectId: project2.id,
          assignedTo: user1.id,
        },
      });
    }
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
