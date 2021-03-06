import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { MESSAGE_REQUEST_PATTERN } from './constants';
import { MessageRequestData } from './interfaces/dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @EventPattern(MESSAGE_REQUEST_PATTERN)
  async handleMessageRequest(@Payload() data: MessageRequestData) {
    const {
      post: { userId, body, roomId },
    } = data;
    const post = await this.postsService.createPost(userId, roomId, body);
    return post;
  }
}
