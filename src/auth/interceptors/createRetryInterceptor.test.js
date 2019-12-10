import { defaultGetBackoffMilliseconds } from './createRetryInterceptor';

describe('createRetryInterceptor: defaultGetBackoffMilliseconds', () => {
  it('returns a number between 2000 and 3000 on the first retry', () => {
    const backoffInMilliseconds = defaultGetBackoffMilliseconds(1);
    expect(backoffInMilliseconds).toBeGreaterThanOrEqual(2000);
    expect(backoffInMilliseconds).toBeLessThanOrEqual(3000);
  });
  it('returns a number between 4000 and 5000 on the second retry', () => {
    const backoffInMilliseconds = defaultGetBackoffMilliseconds(2);
    expect(backoffInMilliseconds).toBeGreaterThanOrEqual(4000);
    expect(backoffInMilliseconds).toBeLessThanOrEqual(5000);
  });
  it('returns a number between 8000 and 9000 on the third retry', () => {
    const backoffInMilliseconds = defaultGetBackoffMilliseconds(3);
    expect(backoffInMilliseconds).toBeGreaterThanOrEqual(8000);
    expect(backoffInMilliseconds).toBeLessThanOrEqual(9000);
  });
  it('returns 16000 fourth or later retry', () => {
    const backoffInMilliseconds = defaultGetBackoffMilliseconds(4);
    expect(backoffInMilliseconds).toEqual(16000);
  });
});
