import { isCommand } from './is-command';
describe('Is Command', () => {
  it('should return false if message is undefined', () => {
    expect(isCommand(undefined)).toBe(false);
  });

  it('should return false if message is null', () => {
    expect(isCommand(null)).toBe(false);
  });

  it('should return false if message is empty string', () => {
    expect(isCommand('')).toBe(false);
  });

  it('should return false if message is similar to a valid stock command', () => {
    expect(isCommand('/stocks=Bla')).toBe(false);
  });

  it('should return true if message is a valid stock command', () => {
    expect(isCommand('/stock=Bla')).toBe(true);
  });
});
