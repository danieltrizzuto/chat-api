export interface BotInboundEventPayload {
  userId: string;
  roomToken: string;
  body: string;
}

export interface BotOutboundEventPayload {
  roomToken: string;
  body: string;
  botName: string;
  userId: string;
  error?: boolean;
}
