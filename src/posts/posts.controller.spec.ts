import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { AmqpPubSub } from 'graphql-rabbitmq-subscriptions';
import { LeanDocument } from 'mongoose';
import { STOCK_COMMAND_RECEIVED } from 'src/common/constants';
import { BotInboundEventPayload } from 'src/common/dto';
import { UserDocument } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import {
  API_RBMQ_PROXY_TOKEN,
  GQL_SUBSCRIPTIONS_PUB_SUB_TOKEN,
  NEW_POST_ACCEPTED,
  NEW_POST_CREATED,
  NEW_POST_ERROR,
  NEW_POST_ERROR_NOTIFY,
} from './constants';
import { PostAcceptedEventPayload } from './interfaces/dto';
import { PostErrorResponse, PostResponse } from './interfaces/responses';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

describe('PostsController', () => {
  let controller: PostsController;
  let postsService: PostsService;
  let rbmqProxy: ClientProxy;
  let gqlSubscriptionsPubSub: AmqpPubSub;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn().mockResolvedValue({
              _id: '1',
              username: 'test-name',
              passwordHash: 'hash',
            } as LeanDocument<UserDocument>),
            create: jest.fn(),
          },
        },
        {
          provide: PostsService,
          useValue: {
            createPost: jest.fn().mockReturnValue({
              _id: 'id',
              body: 'body',
              author: 'author',
              roomId: 'roomId',
            }),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('signed'),
            decode: jest.fn().mockReturnValue({ roomId: 'roomId' }),
            verify: jest.fn(),
          },
        },
        {
          provide: API_RBMQ_PROXY_TOKEN,
          useValue: {
            emit: jest.fn(),
          },
        },
        {
          provide: GQL_SUBSCRIPTIONS_PUB_SUB_TOKEN,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PostsController>(PostsController);
    postsService = module.get<PostsService>(PostsService);
    rbmqProxy = module.get<ClientProxy>(API_RBMQ_PROXY_TOKEN);
    gqlSubscriptionsPubSub = module.get<AmqpPubSub>(
      GQL_SUBSCRIPTIONS_PUB_SUB_TOKEN,
    );
  });

  // Data validation

  it('handleClientPostRequest should not emit if payload is null', async () => {
    const rbmqProxyEmitSpy = jest.spyOn(rbmqProxy, 'emit');
    await controller.handleClientPostRequest(null);

    expect(rbmqProxyEmitSpy).not.toBeCalled();
  });

  it('handleClientPostRequest should not emit if post is null', async () => {
    const rbmqProxyEmitSpy = jest.spyOn(rbmqProxy, 'emit');
    await controller.handleClientPostRequest({
      post: null,
    });

    expect(rbmqProxyEmitSpy).not.toBeCalled();
  });

  it('handleClientPostRequest should not emit if params are null', async () => {
    const rbmqProxyEmitSpy = jest.spyOn(rbmqProxy, 'emit');
    await controller.handleClientPostRequest({
      post: { body: null, roomId: null, userId: null },
    });

    expect(rbmqProxyEmitSpy).not.toBeCalled();
  });

  // Stock command

  it('handleClientPostRequest should emit STOCK_COMMAND_RECEIVED if message is /stock=ticker', async () => {
    const rbmqProxyEmitSpy = jest.spyOn(rbmqProxy, 'emit');
    await controller.handleClientPostRequest({
      post: { body: '/stock=ticker', roomId: '2', userId: '1' },
    });

    const botPayload: BotInboundEventPayload = {
      body: '/stock=ticker',
      roomToken: 'signed',
      userId: '1',
    };

    expect(rbmqProxyEmitSpy).toBeCalledWith(STOCK_COMMAND_RECEIVED, botPayload);
  });

  // Regular post

  it('handleClientPostRequest should emit NEW_POST_ACCEPTED if params are valid', async () => {
    const rbmqProxyEmitSpy = jest.spyOn(rbmqProxy, 'emit');
    await controller.handleClientPostRequest({
      post: { body: 'Hello!', roomId: '2', userId: '1' },
    });

    const botPayload: PostAcceptedEventPayload = {
      body: 'Hello!',
      roomId: '2',
      userId: '1',
      author: 'test-name',
    };

    expect(rbmqProxyEmitSpy).toBeCalledWith(NEW_POST_ACCEPTED, botPayload);
  });

  // Bot Request

  it('handleBotPostRequest should emit on NEW_POST_ACCEPTED if params are valid and no error occurred', async () => {
    const rbmqProxyEmitSpy = jest.spyOn(rbmqProxy, 'emit');
    await controller.handleBotPostRequest({
      body: 'Bot message',
      botName: 'Bot Name',
      roomToken: 'jwt',
      userId: '1',
    });

    const payload: PostAcceptedEventPayload = {
      body: 'Bot message',
      roomId: 'roomId',
      userId: '1',
      author: 'Bot Name',
    };

    expect(rbmqProxyEmitSpy).toBeCalledWith(NEW_POST_ACCEPTED, payload);
    expect(rbmqProxyEmitSpy).not.toBeCalledWith(NEW_POST_ERROR, payload);
  });

  it('handleBotPostRequest should emit on NEW_POST_ERROR if params are valid but a error occurred', async () => {
    const rbmqProxyEmitSpy = jest.spyOn(rbmqProxy, 'emit');
    await controller.handleBotPostRequest({
      body: 'Bot message',
      botName: 'Bot Name',
      roomToken: 'jwt',
      userId: '1',
      error: true,
    });

    const payload: PostAcceptedEventPayload = {
      body: 'Bot message',
      roomId: 'roomId',
      userId: '1',
      author: 'Bot Name',
    };

    expect(rbmqProxyEmitSpy).toBeCalledWith(NEW_POST_ERROR, payload);
    expect(rbmqProxyEmitSpy).not.toBeCalledWith(NEW_POST_ACCEPTED, payload);
  });

  it('handleBotPostRequest should not emit if params are invalid', async () => {
    const rbmqProxyEmitSpy = jest.spyOn(rbmqProxy, 'emit');
    await expect(async () => {
      await controller.handleBotPostRequest({
        body: null,
        botName: null,
        roomToken: null,
        userId: null,
      });
    }).rejects.toThrow();

    expect(rbmqProxyEmitSpy).not.toBeCalled();
  });

  // Post accepted

  it('handlePostAccepted should not create nor publish if params are invalid', async () => {
    const gqlPubSubPublishSpy = jest.spyOn(gqlSubscriptionsPubSub, 'publish');
    const createPostSpy = jest.spyOn(postsService, 'createPost');

    await expect(async () => {
      await controller.handlePostAccepted({
        author: null,
        body: null,
        roomId: null,
        userId: null,
      });
    }).rejects.toThrow();

    expect(gqlPubSubPublishSpy).not.toBeCalled();
    expect(createPostSpy).not.toBeCalled();
  });

  it('handlePostAccepted should create post and publish on NEW_POST_CREATED if params are valid', async () => {
    const gqlPubSubPublishSpy = jest.spyOn(gqlSubscriptionsPubSub, 'publish');
    const createPostSpy = jest.spyOn(postsService, 'createPost');

    await controller.handlePostAccepted({
      author: 'author',
      body: 'body',
      roomId: 'roomId',
      userId: 'userId',
    });

    const response: PostResponse = {
      _id: 'id',
      body: 'body',
      author: 'author',
      roomId: 'roomId',
    };

    expect(createPostSpy).toBeCalledWith('author', 'body', 'roomId', 'userId');
    expect(gqlPubSubPublishSpy).toBeCalledWith(NEW_POST_CREATED, {
      postCreated: response,
    });
  });

  // Bot errors handle

  it('handlePostError should not publish if params are invalid', async () => {
    const gqlPubSubPublishSpy = jest.spyOn(gqlSubscriptionsPubSub, 'publish');

    await expect(async () => {
      await controller.handlePostError({
        author: null,
        body: null,
        roomId: null,
        userId: null,
      });
    }).rejects.toThrow();

    expect(gqlPubSubPublishSpy).not.toBeCalled();
  });

  it('handlePostError should publish on NEW_POST_ERROR_NOTIFY if params are valid', async () => {
    const gqlPubSubPublishSpy = jest.spyOn(gqlSubscriptionsPubSub, 'publish');

    await controller.handlePostError({
      author: 'author',
      body: 'body',
      roomId: 'roomId',
      userId: 'userId',
    });

    const response: PostErrorResponse = {
      body: 'body',
      author: 'author',
      roomId: 'roomId',
      userId: 'userId',
    };

    expect(gqlPubSubPublishSpy).toBeCalledWith(NEW_POST_ERROR_NOTIFY, {
      postError: response,
    });
  });
});
