import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export interface TokenUser {
  _id: string;
  username: string;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const { passwordHash, ...ctxUser } = ctx.getContext().req.user;
    return ctxUser;
  },
);
