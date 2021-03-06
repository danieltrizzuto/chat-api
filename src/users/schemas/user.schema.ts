import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'users' })
export class UserDocument extends Document {
  @Prop()
  _id: string;
  @Prop()
  username: string;
  @Prop()
  passwordHash: string;
}

export const UserSchema = SchemaFactory.createForClass(UserDocument);
