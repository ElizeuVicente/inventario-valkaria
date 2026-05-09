import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    signIn: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call authService.signIn with login dto', async () => {
    const loginDto = { login: 'test@test.com', password: 'password' };
    const expectedResponse = { access_token: 'test-token' };

    mockAuthService.signIn.mockResolvedValue(expectedResponse);

    const result = await controller.signIn(loginDto);

    expect(result).toEqual(expectedResponse);
    expect(mockAuthService.signIn).toHaveBeenCalledWith(loginDto);
  });
});
