import beforeInit from './beforeInit';

it('should create a history object', () => {
  const app = {
    history: null,
  };

  beforeInit(app);

  // Check that it's a history object.
  expect(Object.keys(app.history)).toContain('location');
  expect(Object.keys(app.history)).toContain('push');
  expect(Object.keys(app.history)).toContain('replace');
  expect(Object.keys(app.history)).toContain('go');
  expect(Object.keys(app.history)).toContain('goBack');
  expect(Object.keys(app.history)).toContain('goForward');
  // ... Yup, that's basically a history object.
});
