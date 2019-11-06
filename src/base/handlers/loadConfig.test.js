import loadConfig from './loadConfig';

it('should do nothing to the app', () => {
  const app = {};

  loadConfig(app);

  expect(app).toEqual({});
});
