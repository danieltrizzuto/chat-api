import {
  Controller,
  Inject,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ClientProxy, EventPattern, Payload } from '@nestjs/microservices';
import {
  BotInboundEventPayload,
  BotOutboundEventPayload,
} from 'src/common/dto';
import {
  BOT_POST_REQUEST,
  STOCK_COMMAND_RECEIVED,
} from './../common/constants/index';
import { BotService } from './bot.service';
import { BOT_NAME, BOT_RBMQ_PROXY_TOKEN } from './constants/index';
import { isDataValid } from './logic/is-data-valid';

@Controller('bot')
export class BotController {
  constructor(
    @Inject(BOT_RBMQ_PROXY_TOKEN) private rbmqProxy: ClientProxy,
    private readonly botService: BotService,
  ) {}

  @EventPattern(STOCK_COMMAND_RECEIVED)
  async handleStockCommand(@Payload() data: BotInboundEventPayload) {
    const { body, roomToken, userId } = data;

    if (!body || !roomToken || !userId) {
      return;
    }

    try {
      const [_, stockTicker] = body.split('/stock=');
      const stockData = await this.botService.getStockData(stockTicker);

      if (!isDataValid(stockData)) {
        throw new UnprocessableEntityException();
      }

      const formattedMessage = `${stockData.Symbol} quote is $${stockData.Close} per share.`;

      const payload: BotOutboundEventPayload = {
        body: formattedMessage,
        roomToken,
        botName: BOT_NAME,
        userId,
      };

      this.rbmqProxy.emit(BOT_POST_REQUEST, payload);
    } catch {
      const errorPayload: BotOutboundEventPayload = {
        body,
        roomToken,
        botName: BOT_NAME,
        userId,
        error: true,
      };

      this.rbmqProxy.emit(BOT_POST_REQUEST, errorPayload);
    }
  }
}
