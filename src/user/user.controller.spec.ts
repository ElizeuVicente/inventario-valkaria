import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthGuard } from '../auth/auth.guard';
import { UserEntity } from './entities/user.entity';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockUserService = {
    createUser: jest.fn(),
    findMany: jest.fn(),
    findUserById: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
  };

  const mockAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: AuthGuard, useValue: mockAuthGuard },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a user', async () => {
    const createUserDto = {
      email: 'test@test.com',
      username: 'testuser',
      name: 'Test User',
      password: 'password123',
    };

    const user = new UserEntity({
      id: 'user-1',
      ...createUserDto,
    });

    mockUserService.createUser.mockResolvedValue(user);

    const result = await controller.createUser(createUserDto);

    expect(result).toBeDefined();
    expect(mockUserService.createUser).toHaveBeenCalledWith(createUserDto);
  });

  it('should find user by id', async () => {
    const user = new UserEntity({
      id: 'user-1',
      email: 'test@test.com',
      username: 'testuser',
      name: 'Test User',
      password: 'hashed',
    });

    mockUserService.findUserById.mockResolvedValue(user);

    const result = await controller.findUserById('user-1');

    expect(result).toBeDefined();
    expect(mockUserService.findUserById).toHaveBeenCalledWith('user-1');
  });

  it('should find many users', async () => {
    const users = [
      new UserEntity({
        id: 'user-1',
        email: 'test@test.com',
        username: 'testuser',
        name: 'Test User',
        password: 'hashed',
      }),
    ];

    mockUserService.findMany.mockResolvedValue(users);

    const result = await controller.findMany({});

    expect(result).toBeDefined();
    expect(mockUserService.findMany).toHaveBeenCalled();
  });
});
