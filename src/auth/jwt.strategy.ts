import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { EnvironmentVariables } from 'src/configuration';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService<EnvironmentVariables>,
    private authService: AuthService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('jwtSecret'),
    });
  }

  async validate({ sub }: { sub: string }): Promise<any> {
    const user = await this.usersService.findOne({ _id: sub });
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
