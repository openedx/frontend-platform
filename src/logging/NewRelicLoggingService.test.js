import NewRelicLoggingService, { MAX_ERROR_LENGTH } from './NewRelicLoggingService';

global.newrelic = {
  addPageAction: jest.fn(),
  noticeError: jest.fn(),
};

let service = null;

describe('NewRelicLoggingService', () => {
  beforeEach(() => {
    service = new NewRelicLoggingService();
  });

  describe('logInfo', () => {
    beforeEach(() => {
      global.newrelic.addPageAction.mockReset();
    });

    it('calls New Relic client to log message if the client is available', () => {
      const message = 'Test log';
      service.logInfo(message);
      expect(global.newrelic.addPageAction).toHaveBeenCalledWith('INFO', { message });
    });
  });

  describe('logError', () => {
    beforeEach(() => {
      global.newrelic.noticeError.mockReset();
    });

    it('calls New Relic client to log error if the client is available', () => {
      const error = new Error('Failed!');
      service.logError(error);
      expect(global.newrelic.noticeError).toHaveBeenCalledWith(error, undefined);
    });

    it('calls New Relic client to log error if the client is available', () => {
      const error = new Error('Failed!');
      service.logError(error);
      expect(global.newrelic.noticeError).toHaveBeenCalledWith(error, undefined);
    });

    it('calls New Relic client to log error and merges in customAttributes from the error', () => {
      const error = new Error('Failed!');
      error.customAttributes = {
        boo: 'yah',
        foo: 'gah',
      };
      service.logError(error, { foo: 'wins', bar: 'baz' });
      expect(global.newrelic.noticeError).toHaveBeenCalledWith(error, { boo: 'yah', foo: 'wins', bar: 'baz' });
    });

    it('calls New Relic client with truncated error string', () => {
      const error = new Array(MAX_ERROR_LENGTH + 500 + 1).join('0');
      const expectedError = new Array(MAX_ERROR_LENGTH + 1).join('0');
      service.logError(error);
      expect(global.newrelic.noticeError).toHaveBeenCalledWith(expectedError, undefined);
    });

    it('calls New Relic client with truncated error', () => {
      const error = {
        message: new Array(MAX_ERROR_LENGTH + 500 + 1).join('0'),
      };
      const expectedError = {
        message: new Array(MAX_ERROR_LENGTH + 1).join('0'),
      };
      service.logError(error);
      expect(global.newrelic.noticeError).toHaveBeenCalledWith(expectedError, undefined);
    });
  });
});
