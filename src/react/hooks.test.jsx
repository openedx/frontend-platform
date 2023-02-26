import React from 'react';
import { mount } from 'enzyme';
import { configure, SegmentAnalyticsService } from '../analytics';
import { useTrackColorSchemeChoice } from './hooks';

const mockLoggingService = {
  logError: jest.fn(),
  logInfo: jest.fn(),
};

let matchesValue;

Object.defineProperty(window, 'matchMedia', {
  value: jest.fn().mockImplementation(() => ({ addEventListener: jest.fn(), matches: matchesValue })),
});

const mockAuthApiClient = () => {};
mockAuthApiClient.post = jest.fn().mockResolvedValue(undefined);

// SegmentAnalyticsService inserts a script before the first script element in the document.
document.body.innerHTML = '<script id="stub" />';

function FakeComponent() {
  useTrackColorSchemeChoice('frontend-platform');

  return null;
}

describe('creating mock analytics and sending a color scheme', () => {
  const nameEvent = 'openedx.ui.frontend-platform.prefers-color-scheme.selected';

  beforeEach(() => {
    const service = configure(SegmentAnalyticsService, {
      loggingService: mockLoggingService,
      httpClient: mockAuthApiClient,
      config: { LMS_BASE_URL: 'https://example.com', SEGMENT_KEY: 'test-key' },
    });

    window.analytics.track = jest.fn();

    expect(service.segmentInitialized).toBe(true);
  });

  it('sending a user device color scheme dark', () => {
    mount(<FakeComponent />);
    matchesValue = true;

    expect(window.analytics.track.mock.calls.length).toBe(1);
    expect(window.analytics.track).toBeCalledWith(nameEvent, { preferredColorScheme: 'dark' });
  });

  it('sending a user device color scheme light', () => {
    mount(<FakeComponent />);
    matchesValue = false;

    expect(window.analytics.track.mock.calls.length).toBe(1);
    expect(window.analytics.track).toBeCalledWith(nameEvent, { preferredColorScheme: 'light' });
  });
});
