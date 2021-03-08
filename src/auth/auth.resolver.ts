import { UnauthorizedException } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { AuthInput } from './interfaces/inputs';
import { AuthResponse } from './interfaces/responses';
import { hashPassword } from './logic/hash-password';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Mutation(() => AuthResponse)
  async signUp(@Args('input') input: AuthInput): Promise<AuthResponse> {
    const passwordHash = await hashPassword(input.password);
    const user = await this.usersService.create(input.username, passwordHash);
    const { accessToken, refreshToken } = this.authService.generateTokens(user);

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  @Mutation(() => AuthResponse)
  async login(@Args('input') input: AuthInput): Promise<AuthResponse> {
    const user = await this.authService.validateUser(
      input.username,
      input.password,
    );

    if (!user) {
      throw new UnauthorizedException();
    }

    const { accessToken, refreshToken } = this.authService.generateTokens(user);

    return {
      accessToken,
      refreshToken,
      user,
    };
  }
}
