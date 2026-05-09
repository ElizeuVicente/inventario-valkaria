import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from 'src/database/prisma/prisma.service';

describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw NotFoundException when user not found by id', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue(null);

    await expect(service.findUserById('user-1')).rejects.toThrow('User not found');
  });

  it('should return user when found by id', async () => {
    const user = { id: 'user-1', email: 'test@test.com', username: 'testuser', name: 'Test User', password: 'hashed' };
    mockPrismaService.user.findUnique.mockResolvedValue(user);

    const result = await service.findUserById('user-1');
    expect(result).toBeDefined();
  });

  it('should throw NotFoundException when user not found by email or username', async () => {
    mockPrismaService.user.findFirst.mockResolvedValue(null);

    await expect(service.findUserByEmailOrUsername('test@test.com')).rejects.toThrow('User not found');
  });

  it('should return user when found by email', async () => {
    const user = { id: 'user-1', email: 'test@test.com', username: 'testuser', name: 'Test User', password: 'hashed' };
    mockPrismaService.user.findFirst.mockResolvedValue(user);

    const result = await service.findUserByEmailOrUsername('test@test.com');
    expect(result).toBeDefined();
  });
});
