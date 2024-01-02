/* eslint-disable react/jsx-no-constructed-context-values */
import React from 'react';
import { render } from '@testing-library/react';
import { Route, Routes, MemoryRouter } from 'react-router-dom';
import { getAuthenticatedUser, getLoginRedirectUrl } from '../auth';
import AuthenticatedPageRoute from './AuthenticatedPageRoute';
import AppContext from './AppContext';
import { getConfig } from '../config';
import { sendPageEvent } from '../analytics';

jest.mock('../analytics');
jest.mock('../auth');

describe('AuthenticatedPageRoute', () => {
  const { location } = global;

  beforeEach(() => {
    delete global.location;
    global.location = {
      assign: jest.fn(),
    };
    sendPageEvent.mockReset();
    getLoginRedirectUrl.mockReset();
    getAuthenticatedUser.mockReset();
  });

  afterEach(() => {
    global.location = location;
  });

  it('should redirect to login if not authenticated', () => {
    getAuthenticatedUser.mockReturnValue(null);
    getLoginRedirectUrl.mockReturnValue('http://localhost/login?next=http%3A%2F%2Flocalhost%2Fauthenticated');
    const component = (
      <AppContext.Provider
        value={{
          authenticatedUser: getAuthenticatedUser(),
          config: getConfig(),
        }}
      >
        <MemoryRouter initialEntries={['/authenticated']}>
          <Routes>
            <Route path="/" element={() => <p>Anonymous</p>} />
            <Route path="/authenticated" element={<AuthenticatedPageRoute><p>Authenticated</p></AuthenticatedPageRoute>} />
          </Routes>
        </MemoryRouter>
      </AppContext.Provider>
    );
    global.location.href = 'http://localhost/authenticated';
    render(component);
    expect(getLoginRedirectUrl).toHaveBeenCalledWith('http://localhost/authenticated');
    expect(sendPageEvent).not.toHaveBeenCalled();
    expect(global.location.assign).toHaveBeenCalledWith('http://localhost/login?next=http%3A%2F%2Flocalhost%2Fauthenticated');
  });

  it('should redirect to custom redirect URL if not authenticated', () => {
    getAuthenticatedUser.mockReturnValue(null);
    getLoginRedirectUrl.mockReturnValue('http://localhost/login?next=http%3A%2F%2Flocalhost%2Fauthenticated');
    const authenticatedElement = (
      <AuthenticatedPageRoute redirectUrl="http://localhost/elsewhere">
        <p>Authenticated</p>
      </AuthenticatedPageRoute>
    );
    const component = (
      <AppContext.Provider
        value={{
          authenticatedUser: getAuthenticatedUser(),
          config: getConfig(),
        }}
      >
        <MemoryRouter initialEntries={['/authenticated']}>
          <Routes>
            <Route path="/" component={() => <p>Anonymous</p>} />
            <Route path="/authenticated" element={authenticatedElement} />
          </Routes>
        </MemoryRouter>
      </AppContext.Provider>
    );
    render(component);
    expect(getLoginRedirectUrl).not.toHaveBeenCalled();
    expect(sendPageEvent).not.toHaveBeenCalled();
    expect(global.location.assign).toHaveBeenCalledWith('http://localhost/elsewhere');
  });

  it('should not call login if not the current route', () => {
    getAuthenticatedUser.mockReturnValue(null);
    getLoginRedirectUrl.mockReturnValue('http://localhost/login?next=http%3A%2F%2Flocalhost%2Fauthenticated');
    const component = (
      <AppContext.Provider
        value={{
          authenticatedUser: getAuthenticatedUser(),
          config: getConfig(),
        }}
      >
        <MemoryRouter>
          <Routes>
            <Route path="/" element={<p>Anonymous</p>} />
            <Route path="/authenticated" element={<AuthenticatedPageRoute><p>Authenticated</p></AuthenticatedPageRoute>} />
          </Routes>
        </MemoryRouter>
      </AppContext.Provider>
    );
    const wrapper = render(component);

    expect(getLoginRedirectUrl).not.toHaveBeenCalled();
    expect(global.location.assign).not.toHaveBeenCalled();
    expect(sendPageEvent).not.toHaveBeenCalled();
    const element = wrapper.container.querySelector('p');
    expect(element.textContent).toEqual('Anonymous'); // This is just a sanity check on our setup.
  });

  it('should render authenticated route if authenticated', () => {
    const component = (
      <AppContext.Provider
        value={{
          authenticatedUser: { userId: 12345, username: 'edx' },
          config: getConfig(),
        }}
      >
        <MemoryRouter initialEntries={['/authenticated']}>
          <Routes>
            <Route path="/" element={<p>Anonymous</p>} />
            <Route path="/authenticated" element={<AuthenticatedPageRoute><p>Authenticated</p></AuthenticatedPageRoute>} />
          </Routes>
        </MemoryRouter>
      </AppContext.Provider>
    );
    const wrapper = render(component);
    expect(getLoginRedirectUrl).not.toHaveBeenCalled();
    expect(global.location.assign).not.toHaveBeenCalled();
    expect(sendPageEvent).toHaveBeenCalled();
    const element = wrapper.container.querySelector('p');
    expect(element.textContent).toEqual('Authenticated');
  });
});
