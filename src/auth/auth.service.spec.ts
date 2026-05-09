import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { UserEntity } from '../user/entities/user.entity';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  const mockUserService = {
    findUserByEmailOrUsername: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw NotFoundException if user not found', async () => {
    mockUserService.findUserByEmailOrUsername.mockResolvedValue(null);

    await expect(service.signIn({ login: 'test@test.com', password: 'password' }))
      .rejects.toThrow(NotFoundException);
  });

  it('should throw UnauthorizedException if password is invalid', async () => {
    const user = new UserEntity({
      id: 'user-1',
      email: 'test@test.com',
      username: 'testuser',
      name: 'Test User',
      password: 'hashed-password',
    });
    mockUserService.findUserByEmailOrUsername.mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(service.signIn({ login: 'test@test.com', password: 'wrongpassword' }))
      .rejects.toThrow(UnauthorizedException);
  });

  it('should return access token on successful login', async () => {
    const user = new UserEntity({
      id: 'user-1',
      email: 'test@test.com',
      username: 'testuser',
      name: 'Test User',
      password: 'hashed-password',
    });

    mockUserService.findUserByEmailOrUsername.mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    mockJwtService.signAsync.mockResolvedValue('test-token');

    const result = await service.signIn({ login: 'test@test.com', password: 'password' });

    expect(result).toBeDefined();
    expect(result.access_token).toBe('test-token');
    expect(mockJwtService.signAsync).toHaveBeenCalled();
  });
});
