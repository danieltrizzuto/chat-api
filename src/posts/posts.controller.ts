import {
  Controller,
  Inject,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy, EventPattern, Payload } from '@nestjs/microservices';
import { AmqpPubSub } from 'graphql-rabbitmq-subscriptions';
import {
  BotInboundEventPayload,
  BotOutboundEventPayload,
} from 'src/common/dto';
import { UsersService } from 'src/users/users.service';
import {
  BOT_POST_REQUEST,
  STOCK_COMMAND_RECEIVED,
} from './../common/constants/index';
import {
  API_RBMQ_PROXY_TOKEN,
  GQL_SUBSCRIPTIONS_PUB_SUB_TOKEN,
  NEW_POST_CREATED,
  NEW_POST_ERROR_NOTIFY,
  NEW_POST_REQUEST_RECEIVED,
} from './constants';
import { NEW_POST_ACCEPTED, NEW_POST_ERROR } from './constants/index';
import {
  ClientPostRequestEventPayload,
  PostAcceptedEventPayload,
  PostErrorEventPayload,
} from './interfaces/dto';
import { PostErrorResponse, PostResponse } from './interfaces/responses';
import { isBotPostPayloadValid } from './logic/is-bot-post-payload-valid';
import { isBotPostRequestPayloadValid } from './logic/is-bot-post-request-payload-valid';
import { isCommand } from './logic/is-command';
import { isPostRequestPayloadValid } from './logic/is-post-request-payload-valid';
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
    if (!isPostRequestPayloadValid(payload)) {
      return;
    }

    const {
      post: { body, roomId, userId },
    } = payload;

    if (isCommand(body)) {
      // Sign roomId to assure bot identity and prevent bot from posting on another room
      const roomToken = this.jwtService.sign(
        { roomId },
        { expiresIn: '5 minutes' },
      );

      const botPayload: BotInboundEventPayload = {
        body,
        roomToken,
        userId,
      };

      this.rbmqProxy.emit(STOCK_COMMAND_RECEIVED, botPayload);

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
    if (!isBotPostRequestPayloadValid(payload)) {
      throw new UnprocessableEntityException(payload);
    }

    const { roomToken, body, botName, userId, error } = payload;

    try {
      this.jwtService.verify(roomToken);
    } catch {
      throw new UnauthorizedException();
    }

    const { roomId } = this.jwtService.decode(roomToken) as { roomId: string };

    const emitPayload: PostAcceptedEventPayload = {
      body,
      author: botName,
      roomId,
      userId,
    };

    if (!error) {
      this.rbmqProxy.emit(NEW_POST_ACCEPTED, emitPayload);
      return;
    }

    this.rbmqProxy.emit(NEW_POST_ERROR, emitPayload);
    return;
  }

  @EventPattern(NEW_POST_ACCEPTED)
  async handlePostAccepted(@Payload() payload: PostAcceptedEventPayload) {
    if (!isBotPostPayloadValid(payload)) {
      throw new UnprocessableEntityException(payload);
    }

    const { author, body, roomId, userId } = payload;

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

  @EventPattern(NEW_POST_ERROR)
  async handlePostError(@Payload() payload: PostErrorEventPayload) {
    if (!isBotPostPayloadValid(payload)) {
      throw new UnprocessableEntityException(payload);
    }

    const { author, body, roomId, userId } = payload;

    const response: PostErrorResponse = {
      body,
      author,
      roomId,
      userId,
    };

    this.gqlSubscriptionsPubSub.publish(NEW_POST_ERROR_NOTIFY, {
      postError: response,
    });
  }
}
