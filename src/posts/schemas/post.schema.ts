import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'posts', timestamps: true })
export class PostDocument extends Document {
  @Prop()
  _id: string;

  @Prop({ index: true })
  userId?: string;

  @Prop({ index: true })
  roomId: string;

  @Prop()
  body: string;

  @Prop()
  author: string;
}

export const PostSchema = SchemaFactory.createForClass(PostDocument);
