import error from './error';

it('should log the App error', () => {
  const app = {
    loggingService: {
      logError: jest.fn(),
    },
    error: {
      message: 'oh no!',
    },
  };
  error(app);
  expect(app.loggingService.logError).toHaveBeenCalledWith({ message: 'oh no!' });
});
