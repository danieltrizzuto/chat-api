import { HttpModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EnvironmentVariables } from 'src/configuration';
import { BotController } from './bot.controller';
import { BotService } from './bot.service';
import { BOT_RBMQ_PROXY_TOKEN } from './constants';

@Module({
  imports: [
    HttpModule,
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        name: BOT_RBMQ_PROXY_TOKEN,
        useFactory: (config: ConfigService) => {
          const broker = config.get<EnvironmentVariables['broker']>('broker');
          return {
            transport: Transport.RMQ,
            options: {
              urls: [broker.uri],
              queue: broker.posts_queue,
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
  controllers: [BotController],
  providers: [BotService],
})
export class BotModule {}
