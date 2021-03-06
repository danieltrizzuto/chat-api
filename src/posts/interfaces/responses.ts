import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CreatePostResponse {
  @Field()
  _id: string;
}
