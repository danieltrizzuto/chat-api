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

  @Field()
  subscribedRoom: string;
}

@InputType()
export class PostsInput {
  @Field()
  roomId: string;
}

@InputType()
export class PostErrorInput {
  @Field()
  accessToken: string;

  @Field()
  userId: string;
}
