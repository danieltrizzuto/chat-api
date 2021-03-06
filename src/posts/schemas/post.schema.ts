import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'posts' })
export class PostDocument extends Document {
  @Prop()
  _id: string;
  @Prop()
  userId: string;
  @Prop()
  roomId: string;
  @Prop()
  body: string;
}

export const PostSchema = SchemaFactory.createForClass(PostDocument);
