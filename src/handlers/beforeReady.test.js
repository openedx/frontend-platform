import beforeReady from './beforeReady';

it('should do nothing to the app', () => {
  const app = {};

  beforeReady(app);

  expect(app).toEqual({});
});
