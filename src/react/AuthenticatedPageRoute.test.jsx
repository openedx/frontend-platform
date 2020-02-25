import React from 'react';
import { mount } from 'enzyme';
import { Router, Route } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { getAuthenticatedUser, getLoginRedirectUrl } from '../auth';
import AuthenticatedPageRoute from './AuthenticatedPageRoute';
import AppContext from './AppContext';
import { getConfig } from '../config';
import { sendPageEvent } from '../analytics';

jest.mock('../analytics');
jest.mock('../auth');

describe('AuthenticatedPageRoute', () => {
  const { location } = global;
  let history;

  beforeEach(() => {
    delete global.location.assign;
    global.location.assign = jest.fn();
    sendPageEvent.mockReset();
    getLoginRedirectUrl.mockReset();
    getAuthenticatedUser.mockReset();
    history = createBrowserHistory();
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
        <Router history={history}>
          <Route exact path="/" component={() => <p>Anonymous</p>} />
          <AuthenticatedPageRoute path="/authenticated" component={() => <p>Authenticated</p>} />
        </Router>
      </AppContext.Provider>
    );
    history.push('/authenticated');
    mount(component);
    expect(getLoginRedirectUrl).toHaveBeenCalledWith('http://localhost/authenticated');
    expect(sendPageEvent).not.toHaveBeenCalled();
    expect(global.location.assign).toHaveBeenCalledWith('http://localhost/login?next=http%3A%2F%2Flocalhost%2Fauthenticated');
  });

  it('should redirect to custom redirect URL if not authenticated', () => {
    getAuthenticatedUser.mockReturnValue(null);
    getLoginRedirectUrl.mockReturnValue('http://localhost/login?next=http%3A%2F%2Flocalhost%2Fauthenticated');
    const component = (
      <AppContext.Provider
        value={{
          authenticatedUser: getAuthenticatedUser(),
          config: getConfig(),
        }}
      >
        <Router history={history}>
          <Route exact path="/" component={() => <p>Anonymous</p>} />
          <AuthenticatedPageRoute redirectUrl="http://localhost/elsewhere" path="/authenticated" component={() => <p>Authenticated</p>} />
        </Router>
      </AppContext.Provider>
    );
    history.push('/authenticated');
    mount(component);
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
        <Router history={history}>
          <Route exact path="/" component={() => <p>Anonymous</p>} />
          <AuthenticatedPageRoute path="/authenticated" component={() => <p>Authenticated</p>} />
        </Router>
      </AppContext.Provider>
    );
    history.push('/');
    const wrapper = mount(component);

    expect(getLoginRedirectUrl).not.toHaveBeenCalled();
    expect(global.location.assign).not.toHaveBeenCalled();
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
    expect(getLoginRedirectUrl).not.toHaveBeenCalled();
    expect(global.location.assign).not.toHaveBeenCalled();
    expect(sendPageEvent).toHaveBeenCalled();
    const element = wrapper.find('p');
    expect(element.text()).toEqual('Authenticated');
  });
});
