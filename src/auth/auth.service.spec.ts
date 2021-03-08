import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { LeanDocument } from 'mongoose';
import { User } from 'src/users/interfaces/responses';
import { UserDocument } from 'src/users/schemas/user.schema';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  // User validation

  it('validateUser should return null if no user found', async () => {
    jest.spyOn(usersService, 'findOne').mockResolvedValue(null);

    const response = await service.validateUser('username', 'password');
    expect(response).toBe(null);
  });

  it('validateUser should return null if user found but password is not correct', async () => {
    jest.spyOn(usersService, 'findOne').mockResolvedValue({
      passwordHash: 'not-correct',
    } as LeanDocument<UserDocument>);

    const response = await service.validateUser('username', '12345');
    expect(response).toBe(null);
  });

  it('validateUser should return user without passwordHash if user found and password is correct', async () => {
    jest.spyOn(usersService, 'findOne').mockResolvedValue({
      passwordHash:
        '95a9b9aa15f6d970:98a34cf16c8e81dcf1df49cc945d7c28f90d3d85e9af57bd5c767b943388112565a9fcf34e3672a63e7642a6c720734a7bcf94bc05940885e1c9db95f235367b',
      _id: '1',
      username: 'test',
    } as LeanDocument<UserDocument>);

    const response = await service.validateUser('username', '12345');
    expect(response).toStrictEqual({
      _id: '1',
      username: 'test',
    });
  });

  // Tokens generation

  it('generateTokens should return accessToken and refreshToken', () => {
    const { accessToken, refreshToken } = service.generateTokens({
      _id: '1',
    } as User);

    expect(accessToken).toBe('token');
    expect(refreshToken).toBe('token');
  });
});
