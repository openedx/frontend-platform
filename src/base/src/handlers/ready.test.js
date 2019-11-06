import ready from './ready';

it('should do nothing to the app', () => {
  const app = {};

  ready(app);

  expect(app).toEqual({});
});
