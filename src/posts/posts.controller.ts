import { Controller, Inject } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AmqpPubSub } from 'graphql-rabbitmq-subscriptions';
import { UsersService } from 'src/users/users.service';
import {
  MESSAGE_CREATED_PATTERN,
  MESSAGE_REQUEST_PATTERN,
  SUBSCRIPTIONS_PUB_SUB_TOKEN,
} from './constants';
import { MessageRequestData } from './interfaces/dto';
import { PostResponse } from './interfaces/responses';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly usersService: UsersService,
    private readonly postsService: PostsService,
    @Inject(SUBSCRIPTIONS_PUB_SUB_TOKEN)
    private readonly subscriptionsPubSub: AmqpPubSub,
  ) {}

  @EventPattern(MESSAGE_REQUEST_PATTERN)
  async handleMessageRequest(@Payload() data: MessageRequestData) {
    const {
      post: { userId, body, roomId },
    } = data;
    const post = await this.postsService.createPost(userId, roomId, body);
    const user = await this.usersService.findOne({ _id: userId });
    const response: PostResponse = {
      _id: post._id,
      body: post.body,
      user: {
        _id: user._id,
        username: user.username,
      },
    };

    this.subscriptionsPubSub.publish(MESSAGE_CREATED_PATTERN, {
      postCreated: response,
    });

    return post;
  }
}
