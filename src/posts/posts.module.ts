import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsResolver } from './posts.resolver';
import { PostsService } from './posts.service';
import { PostDocument, PostSchema } from './schemas/post.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PostDocument.name, schema: PostSchema },
    ]),
  ],
  providers: [PostsResolver, PostsService],
})
export class PostsModule {}
