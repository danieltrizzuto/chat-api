import { isPostPayloadValid } from './is-post-payload-valid';
describe('Post Request Payload', () => {
  it('should return false if payload is undefined', () => {
    expect(isPostPayloadValid(undefined)).toBe(false);
  });

  it('should return false if payload is null', () => {
    expect(isPostPayloadValid(null)).toBe(false);
  });

  it('should return false if payload is empty object', () => {
    expect(isPostPayloadValid({} as any)).toBe(false);
  });

  it('should return true if payload is complete', () => {
    expect(
      isPostPayloadValid({
        author: 'Dani',
        body: 'test',
        roomId: '1',
        userId: '12',
      }),
    ).toBe(true);
  });
});
