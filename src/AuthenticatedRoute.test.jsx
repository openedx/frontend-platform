import React from 'react';
import { mount } from 'enzyme';
import { Router, Route } from 'react-router-dom';
import { createBrowserHistory } from 'history';

import AuthenticatedRoute from './AuthenticatedRoute';
import App from './App';
import AppContext from './AppContext';

describe('AuthenticatedRoute', () => {
  beforeEach(() => {
    App.apiClient = {
      login: jest.fn(),
    };
    App.history = createBrowserHistory();
  });

  it('should call login if not authenticated', () => {
    App.authenticatedUser = null;

    const component = (
      <AppContext.Provider value={{ authenticatedUser: App.authenticatedUser, config: App.config }}>
        <Router history={App.history}>
          <Route exact path="/" component={() => <p>Anonymous</p>} />
          <AuthenticatedRoute path="/authenticated" component={() => <p>Authenticated</p>} />
        </Router>
      </AppContext.Provider>
    );
    App.history.push('/authenticated');
    mount(component);

    expect(App.apiClient.login).toHaveBeenCalledWith('http://localhost/authenticated');
  });

  it('should not call login if not the current route', () => {
    App.authenticatedUser = null;

    const component = (
      <AppContext.Provider value={{ authenticatedUser: App.authenticatedUser, config: App.config }}>
        <Router history={App.history}>
          <Route exact path="/" component={() => <p>Anonymous</p>} />
          <AuthenticatedRoute path="/authenticated" component={() => <p>Authenticated</p>} />
        </Router>
      </AppContext.Provider>
    );
    App.history.push('/');
    const wrapper = mount(component);

    expect(App.apiClient.login).not.toHaveBeenCalled();
    const element = wrapper.find('p');
    expect(element.text()).toEqual('Anonymous'); // This is just a sanity check on our setup.
  });

  it('should render authenticated route if authenticated', () => {
    App.authenticatedUser = { userId: 12345, username: 'edx' };

    const component = (
      <AppContext.Provider value={{ authenticatedUser: App.authenticatedUser, config: App.config }}>
        <Router history={App.history}>
          <Route exact path="/" component={() => <p>Anonymous</p>} />
          <AuthenticatedRoute path="/authenticated" component={() => <p>Authenticated</p>} />
        </Router>
      </AppContext.Provider>
    );
    App.history.push('/authenticated');
    const wrapper = mount(component);
    expect(App.apiClient.login).not.toHaveBeenCalled();
    const element = wrapper.find('p');
    expect(element.text()).toEqual('Authenticated');
  });
});
