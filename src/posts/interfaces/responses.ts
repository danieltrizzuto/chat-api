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
}
