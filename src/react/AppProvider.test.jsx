import React from 'react';
import { createStore } from 'redux';
import { mount } from 'enzyme';
import AppProvider from './AppProvider';
import { initialize } from '../initialize';
import { configure, sendTrackEvent, SegmentAnalyticsService } from '../analytics/index';

const mockLoggingService = {
  logError: jest.fn(),
  logInfo: jest.fn(),
};

Object.defineProperty(window, 'matchMedia', {
  value: jest.fn().mockImplementation(() => ({ addEventListener: jest.fn() })),
});

const mockAuthApiClient = () => {};
mockAuthApiClient.post = jest.fn().mockResolvedValue(undefined);

// SegmentAnalyticsService inserts a script before the first script element in the document.
document.body.innerHTML = '<script id="stub" />';

jest.mock('../auth', () => ({
  configure: () => {},
  getAuthenticatedUser: () => null,
  fetchAuthenticatedUser: () => null,
  getAuthenticatedHttpClient: () => ({}),
  AUTHENTICATED_USER_CHANGED: 'user_changed',
}));

describe('AppProvider', () => {
  beforeEach(async () => {
    await initialize({
      loggingService: jest.fn(() => ({
        logError: jest.fn(),
        logInfo: jest.fn(),
      })),
      messages: {
        ar: {},
        'es-419': {},
        fr: {},
        'zh-cn': {},
        ca: {},
        he: {},
        id: {},
        'ko-kr': {},
        pl: {},
        'pt-br': {},
        ru: {},
        th: {},
        uk: {},
      },
    });
  });

  describe('creating mock analytics and sending a color scheme', () => {
    beforeEach(() => {
      const service = configure(SegmentAnalyticsService, {
        loggingService: mockLoggingService,
        httpClient: mockAuthApiClient,
        config: { LMS_BASE_URL: 'https://example.com', SEGMENT_KEY: 'test-key' },
      });

      window.analytics.track = jest.fn();

      expect(service.segmentInitialized).toBe(true);
    });

    function testSendTrackEvent() {
      const testName = 'prefers-color-scheme';
      const testProperties = { preferredColorScheme: 'light' };

      sendTrackEvent(testName, testProperties);

      expect(window.analytics.track.mock.calls.length).toBe(1);
      expect(window.analytics.track).toBeCalledWith(testName, testProperties);
    }

    it('sending a user device color scheme', () => {
      testSendTrackEvent();
    });
  });

  it('should render its children', () => {
    const component = (
      <AppProvider store={createStore(state => state)}>
        <div>Child One</div>
        <div>Child Two</div>
      </AppProvider>
    );

    const wrapper = mount(component);
    const list = wrapper.find('div');
    expect(list.length).toEqual(2);
    expect(list.at(0).text()).toEqual('Child One');
    expect(list.at(1).text()).toEqual('Child Two');

    const reduxProvider = wrapper.find('Provider');
    expect(reduxProvider.length).toEqual(1);
  });

  it('should skip redux Provider if not given a store', () => {
    const component = (
      <AppProvider>
        <div>Child One</div>
        <div>Child Two</div>
      </AppProvider>
    );

    const wrapper = mount(component);
    const list = wrapper.find('div');
    expect(list.length).toEqual(2);
    expect(list.at(0).text()).toEqual('Child One');
    expect(list.at(1).text()).toEqual('Child Two');

    const reduxProvider = wrapper.find('Provider');
    expect(reduxProvider.length).toEqual(0);
  });
});
