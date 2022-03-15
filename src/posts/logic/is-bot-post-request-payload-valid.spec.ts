import { isBotPostRequestPayloadValid } from './is-bot-post-request-payload-valid';

describe('Bot Post Request Payload', () => {
  it('should return false if payload is undefined', () => {
    expect(isBotPostRequestPayloadValid(undefined)).toBe(false);
  });

  it('should return false if payload is null', () => {
    expect(isBotPostRequestPayloadValid(null)).toBe(false);
  });

  it('should return false if payload is empty object', () => {
    expect(isBotPostRequestPayloadValid({} as any)).toBe(false);
  });

  it('should return true if payload is complete', () => {
    expect(
      isBotPostRequestPayloadValid({
        botName: 'Test bot',
        roomToken: 'jwt',
        body: 'test',
        userId: '12',
      }),
    ).toBe(true);
  });
});
