import { Field, ObjectType } from '@nestjs/graphql';
import { User } from 'src/users/interfaces/responses';

@ObjectType()
export class AuthResponse {
  @Field()
  accessToken: string;
  @Field()
  refreshToken: string;
  @Field()
  user: User;
}
