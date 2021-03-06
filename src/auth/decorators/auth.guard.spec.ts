import { GqlAuthGuard } from './auth.guard';

describe('GqlAuthGuard', () => {
  it('should be defined', () => {
    expect(new GqlAuthGuard()).toBeDefined();
  });
});
