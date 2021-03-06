import { Inject, Logger, UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { ClientProxy } from '@nestjs/microservices';
import { GqlAuthGuard } from 'src/auth/decorators/auth.guard';
import { CurrentUser, TokenUser } from 'src/auth/decorators/current-user';
import { MESSAGE_REQUEST_PATTERN, RBMQ_PROXY_TOKEN } from './constants';
import { MessageRequestData } from './interfaces/dto';
import { CreatePostInput } from './interfaces/inputs';
import { CreatePostResponse } from './interfaces/responses';

@Resolver()
export class PostsResolver {
  constructor(@Inject(RBMQ_PROXY_TOKEN) private rbmqProxy: ClientProxy) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => CreatePostResponse)
  async createPost(
    @Args('input') input: CreatePostInput,
    @CurrentUser() user: TokenUser,
  ): Promise<CreatePostResponse> {
    try {
      const { roomId, body } = input;

      await this.rbmqProxy
        .emit<string, MessageRequestData>(MESSAGE_REQUEST_PATTERN, {
          post: { body, roomId, userId: user._id },
        })
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
}
