import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreatePostInput {
  @Field()
  roomId: string;
  @Field()
  body: string;
}

@InputType()
export class PostCreatedInput {
  @Field()
  accessToken: string;
}
