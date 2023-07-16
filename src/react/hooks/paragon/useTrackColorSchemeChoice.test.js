import { renderHook } from '@testing-library/react-hooks';

import { sendTrackEvent } from '../../../analytics';

import useTrackColorSchemeChoice from './useTrackColorSchemeChoice';

jest.mock('../../../analytics', () => ({
  ...jest.requireActual('../../../analytics'),
  sendTrackEvent: jest.fn(),
}));

const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();
let matchesMock;

Object.defineProperty(window, 'matchMedia', {
  value: jest.fn(() => ({
    addEventListener: mockAddEventListener,
    removeEventListener: mockRemoveEventListener,
    matches: matchesMock,
  })),
});

describe('useTrackColorSchemeChoice', () => {
  afterEach(() => {
    mockAddEventListener.mockClear();
    mockRemoveEventListener.mockClear();
    sendTrackEvent.mockClear();
  });

  it('sends dark preferred color schema event if query matches', async () => {
    matchesMock = true;
    renderHook(() => useTrackColorSchemeChoice());

    expect(sendTrackEvent).toHaveBeenCalledTimes(1);
    expect(sendTrackEvent).toHaveBeenCalledWith(
      'openedx.ui.frontend-platform.prefers-color-scheme.selected',
      { preferredColorScheme: 'dark' },
    );
  });

  it('sends light preferred color schema event if query does not match', async () => {
    matchesMock = false;
    renderHook(() => useTrackColorSchemeChoice());

    expect(sendTrackEvent).toHaveBeenCalledTimes(1);
    expect(sendTrackEvent).toHaveBeenCalledWith(
      'openedx.ui.frontend-platform.prefers-color-scheme.selected',
      { preferredColorScheme: 'light' },
    );
  });

  it('adds change event listener to matchMedia query', async () => {
    renderHook(() => useTrackColorSchemeChoice());

    expect(mockAddEventListener).toHaveBeenCalledTimes(1);
    expect(mockAddEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });
});
