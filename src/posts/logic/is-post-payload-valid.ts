import {
  PostAcceptedEventPayload,
  PostErrorEventPayload,
} from '../interfaces/dto';

export const isPostPayloadValid = (
  payload: PostErrorEventPayload | PostAcceptedEventPayload,
) => {
  return !!(
    payload &&
    payload.author &&
    payload.body &&
    payload.roomId &&
    payload.userId
  );
};
