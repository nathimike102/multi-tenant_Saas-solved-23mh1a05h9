// Database Configuration
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  errorFormat: 'pretty',
});

// Global transaction helper
async function transaction(fn) {
  return prisma.$transaction(async (tx) => {
    return fn(tx);
  });
}

module.exports = {
  prisma,
  transaction,
};
