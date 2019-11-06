import MAX_ERROR_LENGTH from './constants';
import NewRelicLoggingService from './NewRelicLoggingService';

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
    NewRelicLoggingService.logInfo(message);
    expect(global.newrelic.addPageAction).toHaveBeenCalledWith('INFO', { message });
  });
});

describe('logError', () => {
  beforeEach(() => {
    global.newrelic.noticeError.mockReset();
  });

  it('calls New Relic client to log error if the client is available', () => {
    const error = new Error('Failed!');
    NewRelicLoggingService.logError(error);
    expect(global.newrelic.noticeError).toHaveBeenCalledWith(error, undefined);
  });

  it('calls New Relic client to log error if the client is available', () => {
    const error = new Error('Failed!');
    NewRelicLoggingService.logError(error);
    expect(global.newrelic.noticeError).toHaveBeenCalledWith(error, undefined);
  });

  it('calls New Relic client with truncated error string', () => {
    const error = new Array(MAX_ERROR_LENGTH + 500 + 1).join('0');
    const expectedError = new Array(MAX_ERROR_LENGTH + 1).join('0');
    NewRelicLoggingService.logError(error);
    expect(global.newrelic.noticeError).toHaveBeenCalledWith(expectedError, undefined);
  });

  it('calls New Relic client with truncated error', () => {
    const error = {
      message: new Array(MAX_ERROR_LENGTH + 500 + 1).join('0'),
    };
    const expectedError = {
      message: new Array(MAX_ERROR_LENGTH + 1).join('0'),
    };
    NewRelicLoggingService.logError(error);
    expect(global.newrelic.noticeError).toHaveBeenCalledWith(expectedError, undefined);
  });
});

describe('processApiClientError', () => {
  it('will process an empty object', () => {
    expect(NewRelicLoggingService.processApiClientError())
      .toEqual({
        errorType: 'api-request-config-error',
        errorData: '',
      });
  });
  it('will process a poorly formed axios response object', () => {
    expect(NewRelicLoggingService.processApiClientError({
      request: {},
      response: {},
      config: {},
    })).toEqual({
      errorType: 'api-response-error',
      errorData: '',
      errorStatus: '',
      errorUrl: '',
    });
  });
  it('will process a poorly formed axios request object', () => {
    expect(NewRelicLoggingService.processApiClientError({
      request: {},
      config: {},
    })).toEqual({
      errorType: 'api-request-error',
      errorData: '',
      errorStatus: '',
      errorUrl: '',
      errorMethod: '',
    });
  });
  it('will process an axios request object', () => {
    expect(NewRelicLoggingService.processApiClientError({
      request: {
        responseText: 'Hello',
        responseURL: 'http://edx.org',
        status: 400,
      },
      config: {
        method: 'GET',
        url: 'http://edx.org',
      },
    })).toEqual({
      errorType: 'api-request-error',
      errorData: 'Hello',
      errorStatus: 400,
      errorUrl: 'http://edx.org',
      errorMethod: 'GET',
    });
  });
  it('will process an axios response object', () => {
    expect(NewRelicLoggingService.processApiClientError({
      response: {
        data: 'Hello',
        status: 400,
        config: {
          method: 'GET',
          url: 'http://edx.org',
        },
      },
    })).toEqual({
      errorType: 'api-response-error',
      errorData: JSON.stringify('Hello'),
      errorStatus: 400,
      errorUrl: 'http://edx.org',
    });
  });
  it('will process an axios response object with HTML data in it', () => {
    expect(NewRelicLoggingService.processApiClientError({
      response: {
        data: '<!DOCTYPE html><html>Hi</html>',
        status: 400,
        config: {
          method: 'GET',
          url: 'http://edx.org',
        },
      },
    })).toEqual({
      errorType: 'api-response-error',
      errorData: '<Response is HTML>',
      errorStatus: 400,
      errorUrl: 'http://edx.org',
    });
  });
});

describe('logApiClientError', () => {
  beforeEach(() => {
    global.newrelic.noticeError.mockReset();
    global.newrelic.addPageAction.mockReset();
  });

  it('calls New Relic client to log info when error has request object', () => {
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

    const expectedAttributes = {
      message: 'API request failed: 400 get http://example.com Very bad request',
      errorType: 'api-request-error',
      errorStatus: error.request.status,
      errorMethod: error.config.method,
      errorUrl: error.request.responseURL,
      errorData: error.request.responseText,
    };
    NewRelicLoggingService.logApiClientError(error);
    expect(global.newrelic.addPageAction).toHaveBeenCalledWith('INFO', expectedAttributes);
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
    const message = 'API request failed: 500 http://example.com {"detail":"Very bad request"}';
    const expectedError = new Error(message);
    const expectedAttributes = {
      errorType: 'api-response-error',
      errorStatus: error.response.status,
      errorUrl: error.response.config.url,
      errorData: JSON.stringify(error.response.data),
      test: 'custom',
    };
    NewRelicLoggingService.logApiClientError(error, { test: 'custom' });
    expect(global.newrelic.noticeError).toHaveBeenCalledWith(expectedError, expectedAttributes);
  });

  it('calls New Relic client to log error and ignores html content in response data.', () => {
    const error = {
      response: {
        status: 500,
        data: '<!DOCTYPE html><html lang="en"><body></body></html>',
      },
    };
    const message = 'API request failed: 500  <Response is HTML>';
    const expectedError = new Error(message);
    const expectedAttributes = {
      errorType: 'api-response-error',
      errorStatus: error.response.status,
      errorUrl: '',
      errorData: '<Response is HTML>',
    };
    NewRelicLoggingService.logApiClientError(error);
    expect(global.newrelic.noticeError).toHaveBeenCalledWith(expectedError, expectedAttributes);
  });
});
