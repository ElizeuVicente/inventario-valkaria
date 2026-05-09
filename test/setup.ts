// Mock Prisma BEFORE any imports that use it
jest.mock('../src/database/generated/prisma/client.ts', () => ({
  PrismaClient: jest.fn(),
  Prisma: {},
}), { virtual: true });

// Mock PrismaService
jest.mock('../src/database/prisma/prisma.service.ts', () => ({
  PrismaService: jest.fn().mockImplementation(() => ({})),
}));
