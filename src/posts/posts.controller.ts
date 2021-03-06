import { Controller, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy, EventPattern, Payload } from '@nestjs/microservices';
import { AmqpPubSub } from 'graphql-rabbitmq-subscriptions';
import { UsersService } from 'src/users/users.service';
import {
  GQL_SUBSCRIPTIONS_PUB_SUB_TOKEN,
  MESSAGE_CREATED_PATTERN,
  MESSAGE_INTERNAL_REQUEST_PATTERN,
  RBMQ_PROXY_TOKEN,
} from './constants';
import {
  MESSAGE_ACCEPTED_PATTERN,
  MESSAGE_EXTERNAL_REQUEST_PATTERN,
} from './constants/index';
import { ExternalPostEventData, InternalPostEventData } from './interfaces/dto';
import { PostResponse } from './interfaces/responses';
import { isCommand } from './logic/is-command';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly usersService: UsersService,
    private readonly postsService: PostsService,
    private readonly jwtService: JwtService,
    @Inject(RBMQ_PROXY_TOKEN) private rbmqProxy: ClientProxy,
    @Inject(GQL_SUBSCRIPTIONS_PUB_SUB_TOKEN)
    private readonly gqlSubscriptionsPubSub: AmqpPubSub,
  ) {}

  @EventPattern(MESSAGE_INTERNAL_REQUEST_PATTERN)
  async handleInternalMessageRequest(@Payload() data: InternalPostEventData) {
    const {
      post: { body, roomId, userId },
    } = data;

    if (!body || !roomId || !userId) {
      return;
    }

    if (!isCommand(body)) {
      this.rbmqProxy.emit(MESSAGE_ACCEPTED_PATTERN, data);
      return;
    }

    // Sign roomId to prevent bot from posting on another room
    const roomToken = this.jwtService.sign(roomId, { expiresIn: '5m' });
    // Bot(s) will take from here
    this.rbmqProxy.emit('', { body, roomToken });
    return;
  }

  @EventPattern(MESSAGE_EXTERNAL_REQUEST_PATTERN)
  async handleExternalMessageRequest(@Payload() data: ExternalPostEventData) {
    const {
      post: { roomToken, body },
    } = data;

    if (!body || !roomToken) {
      return;
    }

    try {
      this.jwtService.verify(roomToken);
    } catch {
      // Invalid roomToken
      return;
    }

    this.rbmqProxy.emit(MESSAGE_ACCEPTED_PATTERN, data);
  }

  @EventPattern(MESSAGE_ACCEPTED_PATTERN)
  async handleMessageAccepted(@Payload() data: InternalPostEventData) {
    const {
      post: { userId, body, roomId },
    } = data;

    if (!body || !roomId || !userId) {
      return;
    }

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

    this.gqlSubscriptionsPubSub.publish(MESSAGE_CREATED_PATTERN, {
      postCreated: response,
    });

    return post;
  }
}
