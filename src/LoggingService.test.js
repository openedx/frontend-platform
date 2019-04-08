import MAX_ERROR_LENGTH from './constants';
import LoggingService from './LoggingService';

global.newrelic = {
  addPageAction: jest.fn(),
  noticeError: jest.fn(),
};

describe('logInfo', () => {
  beforeEach(() => {
    global.newrelic.addPageAction.mockReset();
  });

  it('calls New Relic client to log message if the client is available', () => {
    const message = 'Test log';
    LoggingService.logInfo(message);
    expect(global.newrelic.addPageAction).toHaveBeenCalledWith('INFO', { message });
  });
});

describe('logError', () => {
  beforeEach(() => {
    global.newrelic.noticeError.mockReset();
  });

  it('calls New Relic client to log error if the client is available', () => {
    const error = new Error('Failed!');
    LoggingService.logError(error);
    expect(global.newrelic.noticeError).toHaveBeenCalledWith(error, undefined);
  });

  it('calls New Relic client to log error if the client is available', () => {
    const error = new Error('Failed!');
    LoggingService.logError(error);
    expect(global.newrelic.noticeError).toHaveBeenCalledWith(error, undefined);
  });

  it('calls New Relic client with truncated error string', () => {
    const error = new Array(MAX_ERROR_LENGTH + 500 + 1).join('0');
    const expectedError = new Array(MAX_ERROR_LENGTH + 1).join('0');
    LoggingService.logError(error);
    expect(global.newrelic.noticeError).toHaveBeenCalledWith(expectedError, undefined);
  });

  it('calls New Relic client with truncated error', () => {
    const error = {
      message: new Array(MAX_ERROR_LENGTH + 500 + 1).join('0'),
    };
    const expectedError = {
      message: new Array(MAX_ERROR_LENGTH + 1).join('0'),
    };
    LoggingService.logError(error);
    expect(global.newrelic.noticeError).toHaveBeenCalledWith(expectedError, undefined);
  });
});

describe('logAPIErrorResponse', () => {
  beforeEach(() => {
    global.newrelic.noticeError.mockReset();
  });

  it('calls New Relic client to log error when error has request object', () => {
    const error = {
      request: {
        status: 400,
        responseURL: 'http://example.com',
        responseText: 'Very bad request',
      },
      config: {
        method: 'get',
      },
    };
    const message = `${error.request.status} ${error.config.method} ${error.request.responseURL} ${error.request.responseText}`;
    const expectedError = new Error(`API request failed: ${message}`);
    const expectedAttributes = {
      errorType: 'api-request-error',
      errorStatus: error.request.status,
      errorMethod: error.config.method,
      errorUrl: error.request.responseURL,
      errorData: error.request.responseText,
    };
    LoggingService.logAPIErrorResponse(error);
    expect(global.newrelic.noticeError).toHaveBeenCalledWith(expectedError, expectedAttributes);
  });

  it('calls New Relic client to log error when error has response object', () => {
    const error = {
      response: {
        status: 500,
        config: {
          url: 'http://example.com',
        },
        data: {
          detail: 'Very bad request',
        },
      },
    };
    const message = `${error.response.status} ${error.response.config.url} ${JSON.stringify(error.response.data)}`;
    const expectedError = new Error(`API request failed: ${message}`);
    const expectedAttributes = {
      errorType: 'api-response-error',
      errorStatus: error.response.status,
      errorUrl: error.response.config.url,
      errorData: JSON.stringify(error.response.data),
      test: 'custom',
    };
    LoggingService.logAPIErrorResponse(error, { test: 'custom' });
    expect(global.newrelic.noticeError).toHaveBeenCalledWith(expectedError, expectedAttributes);
  });

  it('calls New Relic client to log error and ignores html content in response data.', () => {
    const error = {
      response: {
        status: 500,
        data: '<!DOCTYPE html><html lang="en"><body></body></html>',
      },
    };
    const message = `${error.response.status}  `;
    const expectedError = new Error(`API request failed: ${message}`);
    const expectedAttributes = {
      errorType: 'api-response-error',
      errorStatus: error.response.status,
      errorUrl: '',
      errorData: '',
    };
    LoggingService.logAPIErrorResponse(error);
    expect(global.newrelic.noticeError).toHaveBeenCalledWith(expectedError, expectedAttributes);
  });
});
