import React from 'react';
import PropTypes from 'prop-types';
import { mount } from 'enzyme';
import { MemoryRouter, Switch } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import { configure } from '../AuthenticatedApiClient/index';

import PrivateRoute from './index';

configure({
  appBaseUrl: process.env.BASE_URL,
  accessTokenCookieName: process.env.ACCESS_TOKEN_COOKIE_NAME,
  csrfTokenApiPath: '/get-csrf-token',
  loginUrl: process.env.LOGIN_URL,
  logoutUrl: process.env.LOGOUT_URL,
  refreshAccessTokenEndpoint: process.env.REFRESH_ACCESS_TOKEN_ENDPOINT,
  loggingService: {
    logError: jest.fn(),
    logInfo: jest.fn(),
  },
});

window.location.assign = jest.fn();
const mockStore = configureMockStore([]);

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
        path={props.path}
        component={TestAuthenticatedComponent}
        redirect={props.redirect}
      />
    </Switch>
  </MemoryRouter>
);

PrivateRouteWrapper.propTypes = {
  store: PropTypes.shape({}).isRequired,
  initialEntries: PropTypes.arrayOf(PropTypes.string).isRequired,
  path: PropTypes.string,
  redirect: PropTypes.string.isRequired,
};

PrivateRouteWrapper.defaultProps = {
  path: '/authenticated',
};

describe('PrivateRoute', () => {
  beforeEach(() => {
    window.location.assign.mockReset();
  });

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

    const encodedRedirectUrl = encodeURIComponent(redirect + route);
    expect(window.location.assign)
      .toHaveBeenCalledWith(`${process.env.LOGIN_URL}?next=${encodedRedirectUrl}`);
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

    const encodedRedirectUrl = encodeURIComponent(redirect + route);
    expect(window.location.assign)
      .toHaveBeenCalledWith(`${process.env.LOGIN_URL}?next=${encodedRedirectUrl}`);
  });

  it('redirects to correct URL even if path has match params', () => {
    const store = mockStore({});
    const route = '/12345';
    const redirect = 'https://example.com';

    mount((
      <PrivateRouteWrapper
        store={store}
        initialEntries={[route]}
        path="/:id"
        redirect={redirect}
      />
    ));

    const encodedRedirectUrl = encodeURIComponent(redirect + route);
    expect(window.location.assign)
      .toHaveBeenCalledWith(`${process.env.LOGIN_URL}?next=${encodedRedirectUrl}`);
  });
});
