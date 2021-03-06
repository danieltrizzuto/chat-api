import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field()
  _id: string;
  @Field()
  username: string;
}
