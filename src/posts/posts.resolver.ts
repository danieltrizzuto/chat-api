import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { GqlAuthGuard } from 'src/auth/decorators/auth.guard';
import { CurrentUser, TokenUser } from 'src/auth/decorators/current-user';
import { CreatePostInput } from './interfaces/inputs';
import { CreatePostResponse } from './interfaces/responses';
import { PostsService } from './posts.service';

@Resolver()
export class PostsResolver {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => CreatePostResponse)
  async createPost(
    @Args('input') input: CreatePostInput,
    @CurrentUser() user: TokenUser,
  ): Promise<CreatePostResponse> {
    const { roomId, body } = input;
    const post = await this.postsService.createPost(user._id, roomId, body);

    return {
      _id: post._id,
    };
  }
}
