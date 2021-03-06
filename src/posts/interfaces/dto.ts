export interface InternalPostEventData {
  post: {
    body: string;
    roomId: string;
    userId: string;
  };
}

export interface ExternalPostEventData {
  post: {
    roomToken: string;
    body: string;
  };
}
