import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import { GqlAuthGuard } from 'src/auth/auth.guard';
import { UsersService } from 'src/users/users.service';
import { User } from './interfaces/responses';

@Resolver()
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => User)
  async user(): Promise<User> {
    return {
      _id: '1',
      username: 'ad',
    };
  }
}
