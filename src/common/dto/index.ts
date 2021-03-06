export interface BotInboundEventPayload {
  roomToken: string;
  body: string;
}

export interface BotOutboundEventPayload {
  roomToken: string;
  body: string;
  botName: string;
}
