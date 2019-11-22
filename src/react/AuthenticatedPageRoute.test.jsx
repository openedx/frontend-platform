import React from 'react';
import { mount } from 'enzyme';
import { Router, Route } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { getAuthenticatedUser, redirectToLogin } from '../auth';
import AuthenticatedPageRoute from './AuthenticatedPageRoute';
import AppContext from './AppContext';
import { getConfig } from '../config';
import { sendPageEvent } from '../analytics';

jest.mock('../analytics');
jest.mock('../auth');

describe('AuthenticatedPageRoute', () => {
  let history;

  beforeEach(() => {
    sendPageEvent.mockReset();
    redirectToLogin.mockReset();
    getAuthenticatedUser.mockReset();
    history = createBrowserHistory();
  });

  it('should call login if not authenticated', () => {
    getAuthenticatedUser.mockReturnValue(null);
    const component = (
      <AppContext.Provider
        value={{
          authenticatedUser: getAuthenticatedUser(),
          config: getConfig(),
        }}
      >
        <Router history={history}>
          <Route exact path="/" component={() => <p>Anonymous</p>} />
          <AuthenticatedPageRoute path="/authenticated" component={() => <p>Authenticated</p>} />
        </Router>
      </AppContext.Provider>
    );
    history.push('/authenticated');
    mount(component);
    expect(sendPageEvent).not.toHaveBeenCalled();
    expect(redirectToLogin).toHaveBeenCalledWith('http://localhost/authenticated');
  });

  it('should not call login if not the current route', () => {
    getAuthenticatedUser.mockReturnValue(null);

    const component = (
      <AppContext.Provider
        value={{
          authenticatedUser: getAuthenticatedUser(),
          config: getConfig(),
        }}
      >
        <Router history={history}>
          <Route exact path="/" component={() => <p>Anonymous</p>} />
          <AuthenticatedPageRoute path="/authenticated" component={() => <p>Authenticated</p>} />
        </Router>
      </AppContext.Provider>
    );
    history.push('/');
    const wrapper = mount(component);

    expect(redirectToLogin).not.toHaveBeenCalled();
    expect(sendPageEvent).not.toHaveBeenCalled();
    const element = wrapper.find('p');
    expect(element.text()).toEqual('Anonymous'); // This is just a sanity check on our setup.
  });

  it('should render authenticated route if authenticated', () => {
    const component = (
      <AppContext.Provider
        value={{
          authenticatedUser: { userId: 12345, username: 'edx' },
          config: getConfig(),
        }}
      >
        <Router history={history}>
          <Route exact path="/" component={() => <p>Anonymous</p>} />
          <AuthenticatedPageRoute path="/authenticated" component={() => <p>Authenticated</p>} />
        </Router>
      </AppContext.Provider>
    );
    history.push('/authenticated');
    const wrapper = mount(component);
    expect(redirectToLogin).not.toHaveBeenCalled();
    expect(sendPageEvent).toHaveBeenCalled();
    const element = wrapper.find('p');
    expect(element.text()).toEqual('Authenticated');
  });
});
