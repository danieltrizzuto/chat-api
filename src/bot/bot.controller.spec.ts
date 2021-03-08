import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { BOT_POST_REQUEST } from 'src/common/constants';
import { BotOutboundEventPayload } from 'src/common/dto';
import { BotController } from './bot.controller';
import { BotService } from './bot.service';
import { BOT_NAME, BOT_RBMQ_PROXY_TOKEN } from './constants';

describe('BotController', () => {
  let controller: BotController;
  let rbmqProxy: ClientProxy;
  let botService: BotService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BotController],
      providers: [
        {
          provide: BOT_RBMQ_PROXY_TOKEN,
          useValue: {
            emit: jest.fn(),
          },
        },
        {
          provide: BotService,
          useValue: {
            getStockData: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<BotController>(BotController);
    rbmqProxy = module.get<ClientProxy>(BOT_RBMQ_PROXY_TOKEN);
    botService = module.get<BotService>(BotService);
  });

  // Data validation

  it('handleStockCommand should not emit if payload is null', async () => {
    const emitSpy = jest.spyOn(rbmqProxy, 'emit');
    await controller.handleStockCommand(null);

    expect(emitSpy).not.toBeCalled();
  });

  it('handleStockCommand should not emit if params are not valid', async () => {
    const emitSpy = jest.spyOn(rbmqProxy, 'emit');
    await controller.handleStockCommand({
      roomToken: null,
      body: null,
      userId: null,
    });

    expect(emitSpy).not.toBeCalled();
  });

  // Invalid ticker

  it('handleStockCommand should emit on BOT_POST_REQUEST with errorPayload if ticker is invalid', async () => {
    const emitSpy = jest.spyOn(rbmqProxy, 'emit');
    jest.spyOn(botService, 'getStockData').mockResolvedValue({
      Close: 'N/D',
      Symbol: 'AAAPL.US',
    } as StockDataResponse);

    await controller.handleStockCommand({
      roomToken: 'token',
      body: '/stock=appl.us',
      userId: 'id',
    });

    const errorPayload: BotOutboundEventPayload = {
      roomToken: 'token',
      body: '/stock=appl.us',
      botName: BOT_NAME,
      userId: 'id',
      error: true,
    };

    expect(emitSpy).toBeCalledWith(BOT_POST_REQUEST, errorPayload);
  });

  // Throw during operation

  it('handleStockCommand should emit on BOT_POST_REQUEST with errorPayload if throws', async () => {
    const emitSpy = jest.spyOn(rbmqProxy, 'emit');
    jest.spyOn(botService, 'getStockData').mockImplementation(() => {
      throw new Error();
    });

    await controller.handleStockCommand({
      roomToken: 'token',
      body: '/stock=appl.us',
      userId: 'id',
    });

    const errorPayload: BotOutboundEventPayload = {
      roomToken: 'token',
      body: '/stock=appl.us',
      botName: BOT_NAME,
      userId: 'id',
      error: true,
    };

    expect(emitSpy).toBeCalledWith(BOT_POST_REQUEST, errorPayload);
  });

  // Valid ticker

  it('handleStockCommand should emit on BOT_POST_REQUEST with success payload and formatted message', async () => {
    const emitSpy = jest.spyOn(rbmqProxy, 'emit');
    jest.spyOn(botService, 'getStockData').mockResolvedValue({
      Close: '120.39',
      Symbol: 'AAPL.US',
    } as StockDataResponse);

    await controller.handleStockCommand({
      roomToken: 'token',
      body: '/stock=appl.us',
      userId: 'id',
    });

    const errorPayload: BotOutboundEventPayload = {
      roomToken: 'token',
      body: `AAPL.US quote is $120.39 per share.`,
      botName: BOT_NAME,
      userId: 'id',
    };

    expect(emitSpy).toBeCalledWith(BOT_POST_REQUEST, errorPayload);
  });
});
