import { Field, ObjectType } from '@nestjs/graphql';

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
  author: string;

  @Field()
  roomId: string;
}

@ObjectType()
export class PostErrorResponse {
  @Field()
  body: string;

  @Field()
  author: string;

  @Field()
  roomId: string;

  @Field()
  userId: string;
}
