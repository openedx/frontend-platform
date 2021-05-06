import NewRelicLoggingService, { MAX_ERROR_LENGTH } from './NewRelicLoggingService';

global.newrelic = {
  addPageAction: jest.fn(),
  noticeError: jest.fn(),
};

let service = null;
const configWithIgnoredErrors = {
  config: {
    IGNORED_ERROR_REGEXES: /^Ignore this error|very minor/,
  },
};
const configWithNullIgnoredErrors = {
  config: {
    IGNORED_ERROR_REGEXES: null,
  },
};
const configWithMissingIgnoredErrors = {
  config: {},
};

describe('NewRelicLoggingService', () => {
  beforeEach(() => {
    service = new NewRelicLoggingService(configWithIgnoredErrors);
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

    it('passes info parameters properly with custom attributes', () => {
      const message = 'Test log';
      const customAttrs = { a: 1, b: 'red', c: 3 };
      service.logInfo(message, customAttrs);
      expect(global.newrelic.addPageAction).toHaveBeenCalledWith('INFO', {
        message: 'Test log', a: 1, b: 'red', c: 3,
      });
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

  describe('ignoredErrors', () => {
    beforeEach(() => {
      global.newrelic.addPageAction.mockReset();
      global.newrelic.noticeError.mockReset();
    });

    it('calls New Relic client as error objects but ignored and sent as page action', () => {
      const error1 = new Error('Ignore this error!');
      error1.customAttributes = {
        hi: 'hello',
      };
      service.logError(error1);
      expect(global.newrelic.addPageAction).toHaveBeenCalledWith('IGNORED_ERROR', {
        message: error1.message, ...error1.customAttributes,
      });

      const error2 = new Error('very minor');
      service.logError(error2);
      expect(global.newrelic.addPageAction).toHaveBeenCalledWith('IGNORED_ERROR', {
        message: error2.message,
      });
    });

    it('calls New Relic client as error string but ignored and sent as page action', () => {
      const error = 'Ignore this error!';
      service.logError(error);
      expect(global.newrelic.addPageAction).toHaveBeenCalledWith('IGNORED_ERROR', {
        message: error,
      });
    });

    it('calls New Relic client as error object but with null ignored error config', () => {
      service = new NewRelicLoggingService(configWithNullIgnoredErrors);
      const error = new Error('Ignore this error!');
      service.logError(error);
      expect(global.newrelic.noticeError).toHaveBeenCalledWith(error, undefined);
    });

    it('calls New Relic client as error object but with missing ignored error config', () => {
      service = new NewRelicLoggingService(configWithMissingIgnoredErrors);
      const error = new Error('Ignore this error!');
      service.logError(error);
      expect(global.newrelic.noticeError).toHaveBeenCalledWith(error, undefined);
    });
  });
});
