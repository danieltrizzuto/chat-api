import { ClientPostRequestEventPayload } from '../interfaces/dto';

export const isPostRequestPayloadValid = (
  payload: ClientPostRequestEventPayload,
) => {
  return (
    payload &&
    payload.post &&
    payload.post.body &&
    payload.post.roomId &&
    payload.post.userId
  );
};
