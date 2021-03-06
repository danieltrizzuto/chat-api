import { Field, ObjectType } from '@nestjs/graphql';
import { User } from 'src/users/interfaces/responses';

@ObjectType()
export class CreatePostResponse {
  @Field()
  success: boolean;
}

@ObjectType()
export class PostResponse {
  @Field()
  _id: string;

  @Field()
  body: string;

  @Field()
  user: User;
}
