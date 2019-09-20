import configuration from './configuration';

it('should do nothing to the app', () => {
  const app = {};

  configuration(app);

  expect(app).toEqual({});
});
