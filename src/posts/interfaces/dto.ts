export interface ClientPostRequestEventPayload {
  post: {
    body: string;
    roomId: string;
    userId: string;
  };
}

export interface PostAcceptedEventPayload {
  author: string;
  userId?: string;
  body: string;
  roomId: string;
}
