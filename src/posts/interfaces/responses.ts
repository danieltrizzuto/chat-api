import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CreatePostResponse {
  @Field()
  success: boolean;
}
