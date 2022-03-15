import { isBotPostPayloadValid } from './is-bot-post-payload-valid';
describe('Post Request Payload', () => {
  it('should return false if payload is undefined', () => {
    expect(isBotPostPayloadValid(undefined)).toBe(false);
  });

  it('should return false if payload is null', () => {
    expect(isBotPostPayloadValid(null)).toBe(false);
  });

  it('should return false if payload is empty object', () => {
    expect(isBotPostPayloadValid({} as any)).toBe(false);
  });

  it('should return true if payload is complete', () => {
    expect(
      isBotPostPayloadValid({
        author: 'Dani',
        body: 'test',
        roomId: '1',
        userId: '12',
      }),
    ).toBe(true);
  });
});
