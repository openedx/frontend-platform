import NewRelicLoggingService, { MAX_ERROR_LENGTH } from './NewRelicLoggingService';

global.newrelic = {
  addPageAction: jest.fn(),
  noticeError: jest.fn(),
  setCustomAttribute: jest.fn(),
};

let service = null;
const configWithIgnoredErrors = {
  config: {
    IGNORED_ERROR_REGEX: /^Ignore this error|very minor/,
  },
};
const configWithNullIgnoredErrors = {
  config: {
    IGNORED_ERROR_REGEX: null,
  },
};
const configWithEmptyIgnoredErrors = {
  config: {
    IGNORED_ERROR_REGEX: '',
  },
};
const configWithWhitespaceIgnoredErrors = {
  config: {
    IGNORED_ERROR_REGEX: '     ',
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

    it('handles plain string message properly with custom attributes', () => {
      const message = 'Test log';
      const attrs = { a: 1, b: 'red', c: 3 };
      service.logInfo(message, attrs);
      expect(global.newrelic.addPageAction).toHaveBeenCalledWith('INFO', {
        message, ...attrs,
      });
    });

    it('handles plain string message properly with no custom attributes', () => {
      const message = 'Test log';
      service.logInfo(message);
      expect(global.newrelic.addPageAction).toHaveBeenCalledWith('INFO', {
        message,
      });
    });

    it('handles error object properly with custom attributes', () => {
      const message = 'Test log';
      const attrs = { a: 1, b: 'red', c: 3 };
      const err = { message, customAttributes: attrs };
      service.logInfo(err);
      expect(global.newrelic.addPageAction).toHaveBeenCalledWith('INFO', {
        message, ...attrs,
      });
    });

    it('handles error object properly with no custom attributes', () => {
      const message = 'Test log';
      const err = { message };
      service.logInfo(err);
      expect(global.newrelic.addPageAction).toHaveBeenCalledWith('INFO', {
        message,
      });
    });

    it('handles error object properly with custom attributes in object and param', () => {
      const message = 'Test log';
      const attrsObj = { a: 1, b: 'red', c: 3 };
      const attrsParam = { x: 99, y: 'blue', z: 987 };
      const err = { message, customAttributes: attrsObj };
      service.logInfo(err, attrsParam);
      expect(global.newrelic.addPageAction).toHaveBeenCalledWith('INFO', {
        message, ...attrsObj, ...attrsParam,
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

  describe('setCustomAttribute', () => {
    beforeEach(() => {
      global.newrelic.setCustomAttribute.mockReset();
    });

    it('calls New Relic client with name and value', () => {
      service.setCustomAttribute('foo', 'bar');
      expect(global.newrelic.setCustomAttribute).toHaveBeenCalledWith('foo', 'bar');
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

    it('calls New Relic client as error object but with empty ignored error config', () => {
      service = new NewRelicLoggingService(configWithEmptyIgnoredErrors);
      const error = new Error('Ignore this error!');
      service.logError(error);
      expect(global.newrelic.noticeError).toHaveBeenCalledWith(error, undefined);
    });

    it('calls New Relic client as error object but with whitespace-only ignored error config', () => {
      service = new NewRelicLoggingService(configWithWhitespaceIgnoredErrors);
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
