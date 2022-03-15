import { BotOutboundEventPayload } from 'src/common/dto';

export const isBotPostRequestPayloadValid = (
  payload: BotOutboundEventPayload,
) => {
  return (
    payload &&
    payload.roomToken &&
    payload.body &&
    payload.botName &&
    payload.userId
  );
};
