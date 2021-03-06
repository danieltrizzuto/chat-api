import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'posts', timestamps: true })
export class PostDocument extends Document {
  @Prop()
  _id: string;

  @Prop()
  userId?: string;

  @Prop()
  body: string;

  @Prop()
  author: string;

  @Prop()
  roomId: string;
}

export const PostSchema = SchemaFactory.createForClass(PostDocument);
