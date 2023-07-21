import React from 'react';
import { createStore } from 'redux';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';

import AppProvider from './AppProvider';
import { initialize } from '../initialize';
import { useAppEvent, useTrackColorSchemeChoice, useParagonTheme } from './hooks';
import { AUTHENTICATED_USER_CHANGED, getAuthenticatedUser } from '../auth';
import { CONFIG_CHANGED } from '../constants';
import { getConfig } from '../config';
import { getLocale, LOCALE_CHANGED } from '../i18n';
import AppContext from './AppContext';
import { SELECTED_THEME_VARIANT_KEY, SET_THEME_VARIANT } from './constants';

jest.mock('../auth', () => ({
  ...jest.requireActual('../auth'),
  getAuthenticatedUser: jest.fn(),
  fetchAuthenticatedUser: jest.fn(),
  getAuthenticatedHttpClient: jest.fn().mockReturnValue({}),
  AUTHENTICATED_USER_CHANGED: 'user_changed',
}));

jest.mock('../config', () => ({
  ...jest.requireActual('../config'),
  getConfig: jest.fn().mockReturnValue({
    BASE_URL: 'localhost:8080',
    LMS_BASE_URL: 'localhost:18000',
    LOGIN_URL: 'localhost:18000/login',
    LOGOUT_URL: 'localhost:18000/logout',
    REFRESH_ACCESS_TOKEN_ENDPOINT: 'localhost:18000/oauth2/access_token',
    ACCESS_TOKEN_COOKIE_NAME: 'access_token',
    CSRF_TOKEN_API_PATH: 'localhost:18000/csrf',
  }),
}));

jest.mock('../i18n', () => ({
  ...jest.requireActual('../i18n'),
  getLocale: jest.fn().mockReturnValue('en'),
}));

jest.mock('../analytics', () => ({
  configure: () => { },
  identifyAnonymousUser: jest.fn(),
  identifyAuthenticatedUser: jest.fn(),
}));

jest.mock('./hooks', () => ({
  ...jest.requireActual('./hooks'),
  useAppEvent: jest.fn(),
  useTrackColorSchemeChoice: jest.fn(),
  useParagonTheme: jest.fn().mockImplementation(() => [
    { isThemeLoaded: true, themeVariant: 'light' },
    jest.fn(),
  ]),
}));

describe('AppProvider', () => {
  beforeEach(async () => {
    jest.clearAllMocks();

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

  it('should render its children with a router', () => {
    const component = (
      <AppProvider store={createStore(state => state)}>
        <div className="child">Child One</div>
        <div className="child">Child Two</div>
      </AppProvider>
    );

    const wrapper = render(component);
    const list = wrapper.container.querySelectorAll('div.child');

    expect(wrapper.getByTestId('browser-router')).toBeInTheDocument();
    expect(list.length).toEqual(2);
    expect(list[0].textContent).toEqual('Child One');
    expect(list[1].textContent).toEqual('Child Two');

    const reduxProvider = wrapper.getByTestId('redux-provider');
    expect(reduxProvider).toBeInTheDocument();
  });

  it('should render its children without a router', () => {
    const component = (
      <AppProvider store={createStore(state => state)} wrapWithRouter={false}>
        <div className="child">Child One</div>
        <div className="child">Child Two</div>
      </AppProvider>
    );

    const wrapper = render(component);
    const list = wrapper.container.querySelectorAll('div.child');
    expect(wrapper.queryByTestId('browser-router')).not.toBeInTheDocument();
    expect(list.length).toEqual(2);
    expect(list[0].textContent).toEqual('Child One');
    expect(list[1].textContent).toEqual('Child Two');

    const reduxProvider = wrapper.getByTestId('redux-provider');
    expect(reduxProvider).toBeInTheDocument();
  });

  it('should skip redux Provider if not given a store', () => {
    const component = (
      <AppProvider>
        <div className="child">Child One</div>
        <div className="child">Child Two</div>
      </AppProvider>
    );

    const wrapper = render(component);
    const list = wrapper.container.querySelectorAll('div.child');
    expect(list.length).toEqual(2);
    expect(list[0].textContent).toEqual('Child One');
    expect(list[1].textContent).toEqual('Child Two');

    const reduxProvider = wrapper.queryByTestId('redux-provider');
    expect(reduxProvider).not.toBeInTheDocument();
  });

  describe('paragon theme and brand', () => {
    it('calls trackColorSchemeChoice', () => {
      const Component = (
        <AppProvider>
          <div>Child One</div>
          <div>Child Two</div>
        </AppProvider>
      );
      render(Component);
      expect(useTrackColorSchemeChoice).toHaveBeenCalled();
    });

    it('calls useParagonTheme', () => {
      const Component = (
        <AppProvider>
          <div>Child One</div>
          <div>Child Two</div>
        </AppProvider>
      );
      render(Component);
      expect(useParagonTheme).toHaveBeenCalled();
      expect(useParagonTheme).toHaveBeenCalledWith(
        expect.objectContaining({
          BASE_URL: 'localhost:8080',
          LMS_BASE_URL: 'localhost:18000',
          LOGIN_URL: 'localhost:18000/login',
          LOGOUT_URL: 'localhost:18000/logout',
          REFRESH_ACCESS_TOKEN_ENDPOINT: 'localhost:18000/oauth2/access_token',
          ACCESS_TOKEN_COOKIE_NAME: 'access_token',
          CSRF_TOKEN_API_PATH: 'localhost:18000/csrf',
        }),
      );
    });

    it('blocks rendering until paragon theme is loaded', () => {
      useParagonTheme.mockImplementationOnce(() => [
        { isThemeLoaded: false },
        jest.fn(),
      ]);
      const Component = (
        <AppProvider>
          <div>Child One</div>
          <div>Child Two</div>
        </AppProvider>
      );
      const { container } = render(Component);
      expect(container).toBeEmptyDOMElement();
    });

    it('returns correct `paragonTheme` in context value', async () => {
      const mockUseParagonThemeDispatch = jest.fn();
      useParagonTheme.mockImplementationOnce(() => [
        { isThemeLoaded: true, themeVariant: 'light' },
        mockUseParagonThemeDispatch,
      ]);
      const Component = (
        <AppProvider>
          <AppContext.Consumer>
            {({ paragonTheme }) => (
              <div>
                <p>Is theme loaded: {paragonTheme.state.isThemeLoaded ? 'yes' : 'no'}</p>
                <p>Current theme variant: {paragonTheme.state.themeVariant}</p>
                <button
                  type="button"
                  onClick={() => {
                    const nextThemeVariant = paragonTheme.state.themeVariant === 'light' ? 'dark' : 'light';
                    paragonTheme.setThemeVariant(nextThemeVariant);
                  }}
                >
                  Set theme variant
                </button>
              </div>
            )}
          </AppContext.Consumer>
        </AppProvider>
      );
      render(Component);
      expect(screen.getByText('Is theme loaded: yes')).toBeInTheDocument();
      expect(screen.getByText('Current theme variant: light')).toBeInTheDocument();

      const setThemeVariantBtn = screen.getByRole('button', { name: 'Set theme variant' });
      expect(setThemeVariantBtn).toBeInTheDocument();
      await userEvent.click(setThemeVariantBtn);

      expect(mockUseParagonThemeDispatch).toHaveBeenCalledTimes(1);
      expect(mockUseParagonThemeDispatch).toHaveBeenCalledWith({
        payload: 'dark',
        type: SET_THEME_VARIANT,
      });
      expect(localStorage.setItem).toHaveBeenLastCalledWith(SELECTED_THEME_VARIANT_KEY, 'dark');
    });
  });

  describe('useAppEvent', () => {
    it('subscribes to `AUTHENTICATED_USER_CHANGED`', async () => {
      const Component = (
        <AppProvider>
          <div>Child</div>
        </AppProvider>
      );
      render(Component);
      expect(useAppEvent).toHaveBeenCalledWith(AUTHENTICATED_USER_CHANGED, expect.any(Function));
      const useAppEventMockCalls = useAppEvent.mock.calls;
      const authUserChangedFn = useAppEventMockCalls.find(([event]) => event === AUTHENTICATED_USER_CHANGED)[1];
      expect(authUserChangedFn).toBeDefined();
      const getAuthUserCallCount = getAuthenticatedUser.mock.calls.length;
      authUserChangedFn();
      expect(getAuthUserCallCount + 1).toEqual(getAuthenticatedUser.mock.calls.length);
    });

    it('subscribes to `CONFIG_CHANGED`', async () => {
      const Component = (
        <AppProvider>
          <div>Child</div>
        </AppProvider>
      );
      render(Component);
      expect(useAppEvent).toHaveBeenCalledWith(CONFIG_CHANGED, expect.any(Function));
      const useAppEventMockCalls = useAppEvent.mock.calls;
      const configChangedFn = useAppEventMockCalls.find(([event]) => event === CONFIG_CHANGED)[1];
      expect(configChangedFn).toBeDefined();
      const getConfigCallCount = getConfig.mock.calls.length;
      configChangedFn();
      expect(getConfig.mock.calls.length).toEqual(getConfigCallCount + 1);
    });

    it('subscribes to `LOCALE_CHANGED`', async () => {
      const Component = (
        <AppProvider>
          <div>Child</div>
        </AppProvider>
      );
      render(Component);
      expect(useAppEvent).toHaveBeenCalledWith(LOCALE_CHANGED, expect.any(Function));
      const useAppEventMockCalls = useAppEvent.mock.calls;
      const localeChangedFn = useAppEventMockCalls.find(([event]) => event === LOCALE_CHANGED)[1];
      expect(localeChangedFn).toBeDefined();
      const getLocaleCallCount = getLocale.mock.calls.length;
      localeChangedFn();
      expect(getLocale.mock.calls.length).toEqual(getLocaleCallCount + 1);
    });
  });
});
