import { Controller, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy, EventPattern, Payload } from '@nestjs/microservices';
import { AmqpPubSub } from 'graphql-rabbitmq-subscriptions';
import { BotOutboundEventPayload } from 'src/common/dto';
import { UsersService } from 'src/users/users.service';
import {
  BOT_POST_REQUEST,
  STOCK_COMMAND_RECEIVED,
} from './../common/constants/index';
import {
  API_RBMQ_PROXY_TOKEN,
  GQL_SUBSCRIPTIONS_PUB_SUB_TOKEN,
  NEW_POST_CREATED,
  NEW_POST_REQUEST_RECEIVED,
} from './constants';
import { NEW_POST_ACCEPTED } from './constants/index';
import {
  ClientPostRequestEventPayload,
  PostAcceptedEventPayload,
} from './interfaces/dto';
import { PostResponse } from './interfaces/responses';
import { isCommand } from './logic/is-command';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly usersService: UsersService,
    private readonly postsService: PostsService,
    private readonly jwtService: JwtService,
    @Inject(API_RBMQ_PROXY_TOKEN) private rbmqProxy: ClientProxy,
    @Inject(GQL_SUBSCRIPTIONS_PUB_SUB_TOKEN)
    private readonly gqlSubscriptionsPubSub: AmqpPubSub,
  ) {}

  @EventPattern(NEW_POST_REQUEST_RECEIVED)
  async handleClientPostRequest(
    @Payload() payload: ClientPostRequestEventPayload,
  ) {
    const {
      post: { body, roomId, userId },
    } = payload;

    if (!body || !roomId || !userId) {
      return;
    }

    if (isCommand(body)) {
      // Sign roomId to assure bot identity and prevent bot from posting on another room
      const roomToken = this.jwtService.sign(
        { roomId },
        { expiresIn: '5 minutes' },
      );
      this.rbmqProxy.emit(STOCK_COMMAND_RECEIVED, { body, roomToken });

      return;
    }

    const user = await this.usersService.findOne({ _id: userId });
    const emitPayload: PostAcceptedEventPayload = {
      userId: user._id,
      author: user.username,
      body,
      roomId,
    };
    this.rbmqProxy.emit(NEW_POST_ACCEPTED, emitPayload);
    return;
  }

  @EventPattern(BOT_POST_REQUEST)
  async handleBotPostRequest(@Payload() payload: BotOutboundEventPayload) {
    const { roomToken, body, botName } = payload;

    if (!body || !roomToken || !botName) {
      return;
    }

    try {
      this.jwtService.verify(roomToken);
    } catch {
      // Invalid roomToken
      return;
    }

    const { roomId } = this.jwtService.decode(roomToken) as { roomId: string };

    const emitPayload: PostAcceptedEventPayload = {
      body,
      author: botName,
      roomId,
    };

    this.rbmqProxy.emit(NEW_POST_ACCEPTED, emitPayload);
  }

  @EventPattern(NEW_POST_ACCEPTED)
  async handlePostAccepted(@Payload() payload: PostAcceptedEventPayload) {
    const { author, body, roomId, userId } = payload;

    if (!author || !body || !roomId) {
      return;
    }

    const post = await this.postsService.createPost(
      author,
      body,
      roomId,
      userId,
    );
    const response: PostResponse = {
      _id: post._id,
      body: post.body,
      author: post.author,
      roomId,
    };

    this.gqlSubscriptionsPubSub.publish(NEW_POST_CREATED, {
      postCreated: response,
    });

    return post;
  }
}
