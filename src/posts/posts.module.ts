import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { EnvironmentVariables } from 'src/configuration';
import { RBMQ_PROXY_TOKEN } from './constants/index';
import { PostsController } from './posts.controller';
import { PostsResolver } from './posts.resolver';
import { PostsService } from './posts.service';
import { PostDocument, PostSchema } from './schemas/post.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PostDocument.name, schema: PostSchema },
    ]),
    ConfigModule,
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
  providers: [PostsResolver, PostsService],
  controllers: [PostsController],
})
export class PostsModule {}
