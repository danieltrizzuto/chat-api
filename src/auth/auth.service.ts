import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/interfaces/responses';
import { UsersService } from '../users/users.service';
import { verifyPassword } from './logic/verify-password';

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.usersService.findOne({ username });
    if (!user) {
      return null;
    }
    const isPasswordCorrect = await verifyPassword(password, user.passwordHash);
    if (isPasswordCorrect) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  generateTokens(user: User): Tokens {
    return {
      accessToken: this.jwtService.sign(
        { sub: user._id, kind: 'access' },
        { expiresIn: '30d' },
      ),
      refreshToken: this.jwtService.sign(
        { sub: user._id, kind: 'refresh' },
        { expiresIn: '180d' },
      ),
    };
  }
}
