import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 } from 'uuid';
import { PostDocument } from './schemas/post.schema';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(PostDocument.name)
    private postModel: Model<PostDocument>,
  ) {}

  async createPost(
    author: string,
    body: string,
    roomId: string,
    userId?: string,
  ) {
    const post = await this.postModel.create({
      _id: v4(),
      userId,
      author,
      body,
      roomId,
    });
    if (!post) {
      return null;
    }
    return post.toObject();
  }

  async postsByRoom(roomId: string) {
    return this.postModel.find({ roomId });
  }
}
