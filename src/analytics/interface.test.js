import {
  configure,
  identifyAnonymousUser,
  identifyAuthenticatedUser,
  sendPageEvent,
  sendTrackEvent,
  sendTrackingLogEvent,
  SegmentAnalyticsService,
} from './index';

const eventType = 'test.event';
const eventData = {
  testShallow: 'test-shallow',
  testObject: {
    testDeep: 'test-deep',
  },
};
const testUserId = 99;
const mockLoggingService = {
  logError: jest.fn(),
  logInfo: jest.fn(),
};
const mockAuthApiClient = {
  post: jest.fn().mockResolvedValue(undefined),
};

// SegmentAnalyticsService inserts a script before the first script element
// in the document. Add one here.
document.body.innerHTML = '<script id="stub" />';

beforeEach(() => {
  configure(SegmentAnalyticsService, {
    loggingService: mockLoggingService,
    httpClient: mockAuthApiClient,
    config: {
      LMS_BASE_URL: 'https://example.com',
      SEGMENT_KEY: 'test-key',
    },
  });
  mockLoggingService.logError.mockReset();
  mockAuthApiClient.post.mockReset();
  mockAuthApiClient.post.mockResolvedValue(undefined);
  window.analytics.identify = jest.fn();
  window.analytics.page = jest.fn();
  window.analytics.track = jest.fn();
});

describe('analytics sendTrackingLogEvent', () => {
  it('posts expected data when successful', () => {
    expect.assertions(4);
    return sendTrackingLogEvent(eventType, eventData)
      .then(() => {
        expect(mockAuthApiClient.post.mock.calls.length).toEqual(1);
        expect(mockAuthApiClient.post.mock.calls[0][0]).toEqual('https://example.com/event');
        const expectedData = 'event_type=test.event&event=%7B%22test_shallow%22%3A%22test-shallow%22%2C%22test_object%22%3A%7B%22test_deep%22%3A%22test-deep%22%7D%7D&page=http%3A%2F%2Flocalhost%2F';
        expect(mockAuthApiClient.post.mock.calls[0][1]).toEqual(expectedData);
        const config = mockAuthApiClient.post.mock.calls[0][2];
        expect(config.headers['Content-Type']).toEqual('application/x-www-form-urlencoded');
      });
  });

  it('calls loggingService.logError on error', () => {
    mockAuthApiClient.post.mockRejectedValue('test-error');
    expect.assertions(2);
    return sendTrackingLogEvent(eventType, eventData)
      .then(() => {
        expect(mockLoggingService.logError.mock.calls.length).toBe(1);
        expect(mockLoggingService.logError).toBeCalledWith('test-error');
      });
  });
});

describe('analytics identifyAuthenticatedUser', () => {
  it('calls Segment identify on success', () => {
    const testTraits = { anything: 'Yay!' };
    identifyAuthenticatedUser(testUserId, testTraits);

    expect(window.analytics.identify.mock.calls.length).toBe(1);
    expect(window.analytics.identify).toBeCalledWith(testUserId, testTraits);
  });

  it('throws error if userId is not supplied', () => {
    expect(() => identifyAuthenticatedUser(null))
      .toThrowError(new Error('UserId is required for identifyAuthenticatedUser.'));
  });
});

describe('analytics identifyAnonymousUser', () => {
  it('calls Segment identify on success', () => {
    const testTraits = { anything: 'Yay!' };
    identifyAnonymousUser(testTraits);

    expect(window.analytics.identify.mock.calls.length).toBe(1);
    expect(window.analytics.identify).toBeCalledWith(testTraits);
  });
});

function testSendPageAfterIdentify(identifyFunction) {
  identifyFunction();

  const testCategory = 'test-category';
  const testName = 'test-name';
  const testProperties = { anything: 'Yay!' };
  sendPageEvent(testCategory, testName, testProperties);

  expect(window.analytics.page.mock.calls.length).toBe(1);
  expect(window.analytics.page).toBeCalledWith(testCategory, testName, testProperties);
}

describe('analytics send Page event', () => {
  it('calls Segment page on success after identifyAuthenticatedUser', () => {
    const userId = 1;
    testSendPageAfterIdentify(() => identifyAuthenticatedUser(userId));
  });

  it('calls Segment page on success after identifyAnonymousUser', () => {
    testSendPageAfterIdentify(identifyAnonymousUser);
  });

  it('fails if page called with no identify', () => {
    sendPageEvent();

    expect(mockLoggingService.logError.mock.calls.length).toBe(1);
    expect(mockLoggingService.logError).toBeCalledWith('Identify must be called before other tracking events.');
  });
});

function testSendTrackEventAfterIdentify(identifyFunction) {
  identifyFunction();

  const testName = 'test-name';
  const testProperties = { anything: 'Yay!' };
  sendTrackEvent(testName, testProperties);

  expect(window.analytics.track.mock.calls.length).toBe(1);
  expect(window.analytics.track).toBeCalledWith(testName, testProperties);
}

describe('analytics send Track event', () => {
  it('calls Segment track on success after identifyAuthenticatedUser', () => {
    const userId = 1;
    testSendTrackEventAfterIdentify(() => identifyAuthenticatedUser(userId));
  });

  it('calls Segment track on success after identifyAnonymousUser', () => {
    testSendTrackEventAfterIdentify(identifyAnonymousUser);
  });

  it('fails if track called with no identify', () => {
    sendTrackEvent();

    expect(mockLoggingService.logError.mock.calls.length).toBe(1);
    expect(mockLoggingService.logError).toBeCalledWith('Identify must be called before other tracking events.');
  });
});
