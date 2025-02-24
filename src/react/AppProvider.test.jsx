import React from 'react';
import { createStore } from 'redux';
import { render, screen, waitFor } from '@testing-library/react';
import AppProvider from './AppProvider';
import { initialize } from '../initialize';

jest.mock('../auth', () => ({
  configure: () => {},
  getAuthenticatedUser: () => null,
  fetchAuthenticatedUser: () => null,
  getAuthenticatedHttpClient: () => ({}),
  AUTHENTICATED_USER_CHANGED: 'user_changed',
}));

jest.mock('../analytics', () => ({
  configure: () => {},
  identifyAnonymousUser: jest.fn(),
  identifyAuthenticatedUser: jest.fn(),
}));

jest.mock('./hooks', () => ({
  ...jest.requireActual('./hooks'),
  useTrackColorSchemeChoice: jest.fn(),
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

  it('should render its children with a router', async () => {
    const component = (
      <AppProvider store={createStore(state => state)}>
        <div className="child">Child One</div>
        <div className="child">Child Two</div>
      </AppProvider>
    );

    const wrapper = render(component);
    await waitFor(() => {
      expect(screen.getByText('Child One')).toBeInTheDocument();
      expect(screen.getByText('Child Two')).toBeInTheDocument();
    });
    expect(wrapper.getByTestId('browser-router')).toBeInTheDocument();
    const reduxProvider = wrapper.getByTestId('redux-provider');
    expect(reduxProvider).toBeInTheDocument();
  });

  it('should render its children without a router', async () => {
    const component = (
      <AppProvider store={createStore(state => state)} wrapWithRouter={false}>
        <div className="child">Child One</div>
        <div className="child">Child Two</div>
      </AppProvider>
    );

    const wrapper = render(component);
    await waitFor(() => {
      expect(screen.getByText('Child One')).toBeInTheDocument();
      expect(screen.getByText('Child Two')).toBeInTheDocument();
    });
    expect(wrapper.queryByTestId('browser-router')).not.toBeInTheDocument();
    const reduxProvider = wrapper.getByTestId('redux-provider');
    expect(reduxProvider).toBeInTheDocument();
  });

  it('should skip redux Provider if not given a store', async () => {
    const component = (
      <AppProvider>
        <div className="child">Child One</div>
        <div className="child">Child Two</div>
      </AppProvider>
    );

    const wrapper = render(component);
    expect(screen.getByText('Child One')).toBeInTheDocument();
    expect(screen.getByText('Child Two')).toBeInTheDocument();
    const reduxProvider = wrapper.queryByTestId('redux-provider');
    expect(reduxProvider).not.toBeInTheDocument();
  });
});
