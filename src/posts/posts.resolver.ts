import {
  Inject,
  Logger,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { AmqpPubSub } from 'graphql-rabbitmq-subscriptions';
import { GqlAuthGuard } from 'src/auth/decorators/auth.guard';
import { CurrentUser, TokenUser } from 'src/auth/decorators/current-user';
import {
  API_RBMQ_PROXY_TOKEN,
  GQL_SUBSCRIPTIONS_PUB_SUB_TOKEN,
  NEW_POST_CREATED,
  NEW_POST_REQUEST_RECEIVED,
} from './constants';
import { ClientPostRequestEventPayload } from './interfaces/dto';
import {
  CreatePostInput,
  PostCreatedInput,
  PostsInput,
} from './interfaces/inputs';
import { CreatePostResponse, PostResponse } from './interfaces/responses';
import { PostsService } from './posts.service';

@Resolver()
export class PostsResolver {
  constructor(
    @Inject(API_RBMQ_PROXY_TOKEN) private rbmqProxy: ClientProxy,
    @Inject(GQL_SUBSCRIPTIONS_PUB_SUB_TOKEN)
    private readonly gqlSubscriptionsPubSub: AmqpPubSub,
    private readonly jwtService: JwtService,
    private readonly postsService: PostsService,
  ) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => [PostResponse])
  async posts(@Args('input') input: PostsInput): Promise<PostResponse[]> {
    return this.postsService.postsByRoom(input.roomId);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => CreatePostResponse)
  async createPost(
    @Args('input') input: CreatePostInput,
    @CurrentUser() user: TokenUser,
  ): Promise<CreatePostResponse> {
    try {
      const { roomId, body } = input;

      await this.rbmqProxy
        .emit<string, ClientPostRequestEventPayload>(
          NEW_POST_REQUEST_RECEIVED,
          {
            post: { body, roomId, userId: user._id },
          },
        )
        .toPromise();

      return {
        success: true,
      };
    } catch (e) {
      Logger.error(`Error creating post`, e);
      return {
        success: false,
      };
    }
  }

  @Subscription((returns) => PostResponse)
  postCreated(@Args('input') input: PostCreatedInput) {
    try {
      this.jwtService.verify(input.accessToken);
    } catch {
      throw new UnauthorizedException();
    }

    return this.gqlSubscriptionsPubSub.asyncIterator(NEW_POST_CREATED);
  }
}
