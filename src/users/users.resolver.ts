import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import { GqlAuthGuard } from 'src/auth/decorators/auth.guard';
import { CurrentUser, TokenUser } from 'src/auth/decorators/current-user';
import { UsersService } from 'src/users/users.service';
import { User } from './interfaces/responses';

@Resolver()
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => User)
  async user(@CurrentUser() user: TokenUser): Promise<User> {
    return user;
  }
}
