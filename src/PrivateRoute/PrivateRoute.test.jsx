import React from 'react';
import PropTypes from 'prop-types';
import { mount } from 'enzyme';
import { MemoryRouter, Switch } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';

import PrivateRoute from './index';

const mockStore = configureMockStore([]);
const mockLogin = jest.fn();

const TestAuthenticatedComponent = () => (
  <div>
    <p>Authentication required!</p>
  </div>
);

const PrivateRouteWrapper = props => (
  <MemoryRouter initialEntries={props.initialEntries}>
    <Switch>
      <PrivateRoute
        store={props.store}
        exact
        path="/authenticated"
        component={TestAuthenticatedComponent}
        authenticatedAPIClient={{
          login: mockLogin,
        }}
        redirect={props.redirect}
      />
    </Switch>
  </MemoryRouter>
);

PrivateRouteWrapper.propTypes = {
  store: PropTypes.shape({}).isRequired,
  initialEntries: PropTypes.arrayOf(PropTypes.string).isRequired,
  redirect: PropTypes.string.isRequired,
};

describe('PrivateRoute', () => {
  it('renders private component if authenticated', () => {
    const store = mockStore({
      authentication: {
        userId: '12345',
        username: 'test',
      },
    });

    const wrapper = mount((
      <PrivateRouteWrapper
        store={store}
        initialEntries={['/authenticated']}
        redirect="https://example.com"
      />
    ));
    expect(wrapper.find('p').text()).toEqual('Authentication required!');
  });

  it('renders LoginRedirect if not authenticated, empty auth state', () => {
    const store = mockStore({
      authentication: {},
    });
    const route = '/authenticated';
    const redirect = 'https://example.com';

    mount((
      <PrivateRouteWrapper
        store={store}
        initialEntries={[route]}
        redirect={redirect}
      />
    ));
    expect(mockLogin).toHaveBeenCalledWith(redirect + route);
  });

  it('renders LoginRedirect if not authenticated, missing auth state', () => {
    const store = mockStore({});
    const route = '/authenticated';
    const redirect = 'https://example.com';

    mount((
      <PrivateRouteWrapper
        store={store}
        initialEntries={[route]}
        redirect={redirect}
      />
    ));
    expect(mockLogin).toHaveBeenCalledWith(redirect + route);
  });
});
