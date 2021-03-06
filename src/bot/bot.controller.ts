import { Controller, Inject } from '@nestjs/common';
import { ClientProxy, EventPattern, Payload } from '@nestjs/microservices';
import { RBMQ_PROXY_TOKEN } from 'src/posts/constants';
import { BOT_PATTERN } from './../posts/constants/index';
import { ExternalPostEventData } from './../posts/interfaces/dto';

@Controller('bot')
export class BotController {
  constructor(@Inject(RBMQ_PROXY_TOKEN) private rbmqProxy: ClientProxy) {}

  @EventPattern(BOT_PATTERN)
  async handleInternalMessageRequest(@Payload() data: ExternalPostEventData) {
    const {
      post: { body, roomToken },
    } = data;

    this.rbmqProxy.emit('', { body, roomToken });
    return;
  }
}
