import React from 'react';
import { mount } from 'enzyme';
import { Router, Route } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { redirectToLogin } from '../../auth';

import AuthenticatedPageRoute from './AuthenticatedPageRoute';
import App from './App';
import AppContext from './AppContext';

jest.mock('../../auth', () => ({
  redirectToLogin: jest.fn(),
}));

describe('AuthenticatedPageRoute', () => {
  beforeEach(() => {
    App.history = createBrowserHistory();
    redirectToLogin.mockReset();
  });

  it('should call login if not authenticated', () => {
    App.authenticatedUser = null;

    const component = (
      <AppContext.Provider value={{ authenticatedUser: App.authenticatedUser, config: App.config }}>
        <Router history={App.history}>
          <Route exact path="/" component={() => <p>Anonymous</p>} />
          <AuthenticatedPageRoute path="/authenticated" component={() => <p>Authenticated</p>} />
        </Router>
      </AppContext.Provider>
    );
    App.history.push('/authenticated');
    mount(component);

    expect(redirectToLogin).toHaveBeenCalledWith('http://localhost/authenticated');
  });

  it('should not call login if not the current route', () => {
    App.authenticatedUser = null;

    const component = (
      <AppContext.Provider value={{ authenticatedUser: App.authenticatedUser, config: App.config }}>
        <Router history={App.history}>
          <Route exact path="/" component={() => <p>Anonymous</p>} />
          <AuthenticatedPageRoute path="/authenticated" component={() => <p>Authenticated</p>} />
        </Router>
      </AppContext.Provider>
    );
    App.history.push('/');
    const wrapper = mount(component);

    expect(redirectToLogin).not.toHaveBeenCalled();
    const element = wrapper.find('p');
    expect(element.text()).toEqual('Anonymous'); // This is just a sanity check on our setup.
  });

  it('should render authenticated route if authenticated', () => {
    App.authenticatedUser = { userId: 12345, username: 'edx' };

    const component = (
      <AppContext.Provider value={{ authenticatedUser: App.authenticatedUser, config: App.config }}>
        <Router history={App.history}>
          <Route exact path="/" component={() => <p>Anonymous</p>} />
          <AuthenticatedPageRoute path="/authenticated" component={() => <p>Authenticated</p>} />
        </Router>
      </AppContext.Provider>
    );
    App.history.push('/authenticated');
    const wrapper = mount(component);
    expect(redirectToLogin).not.toHaveBeenCalled();
    const element = wrapper.find('p');
    expect(element.text()).toEqual('Authenticated');
  });
});
