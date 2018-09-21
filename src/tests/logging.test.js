import { logAPIErrorResponse, logInfo, logError } from '../logging';

global.newrelic = {
  addPageAction: jest.fn(),
  noticeError: jest.fn(),
};

describe('logInfo', () => {
  it('calls New Relic client to log message if the client is available', () => {
    const message = 'Test log';
    logInfo(message);
    expect(global.newrelic.addPageAction).toHaveBeenCalledWith('INFO', { message });
  });
});

describe('logError', () => {
  it('calls New Relic client to log error if the client is available', () => {
    const error = new Error('Failed!');
    logError(error);
    expect(global.newrelic.noticeError).toHaveBeenCalledWith(error);
  });
});

describe('logAPIErrorResponse', () => {
  it('calls New Relic client to log error with the API URL', () => {
    const error = { request: 'http://example.com' };
    const expectedError = new Error(`API request failed: ${error.request}`);
    logAPIErrorResponse(error);
    expect(global.newrelic.noticeError).toHaveBeenCalledWith(expectedError);
  });
});
