import { ConsoleLogger } from '@cdm-logger/server';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { AmqpPubSub } from 'graphql-rabbitmq-subscriptions';
import { AuthModule } from 'src/auth/auth.module';
import { EnvironmentVariables } from 'src/configuration';
import { UsersModule } from './../users/users.module';
import {
  RBMQ_PROXY_TOKEN,
  SUBSCRIPTIONS_PUB_SUB_TOKEN,
} from './constants/index';
import { PostsController } from './posts.controller';
import { PostsResolver } from './posts.resolver';
import { PostsService } from './posts.service';
import { PostDocument, PostSchema } from './schemas/post.schema';

const logger: any = ConsoleLogger.create('Chat API');
@Module({
  imports: [
    AuthModule,
    ConfigModule,
    UsersModule,
    MongooseModule.forFeature([
      { name: PostDocument.name, schema: PostSchema },
    ]),
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        name: RBMQ_PROXY_TOKEN,
        useFactory: (config: ConfigService) => {
          const broker = config.get<EnvironmentVariables['broker']>('broker');
          return {
            transport: Transport.RMQ,
            options: {
              urls: [broker.uri],
              queue: broker.queue,
              queueOptions: {
                durable: false,
              },
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [
    PostsResolver,
    PostsService,
    {
      provide: SUBSCRIPTIONS_PUB_SUB_TOKEN,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const broker = config.get<EnvironmentVariables['broker']>('broker');
        return new AmqpPubSub({
          config: broker.uri,
          logger,
        });
      },
    },
  ],
  controllers: [PostsController],
})
export class PostsModule {}
