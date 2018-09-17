# frontend-auth

[![Build Status](https://api.travis-ci.org/edx/frontend-auth.svg?branch=master)](https://travis-ci.org/edx/frontend-auth) [![Coveralls](https://img.shields.io/coveralls/edx/frontend-auth.svg?branch=master)](https://coveralls.io/github/edx/frontend-auth)
[![npm_version](https://img.shields.io/npm/v/@edx/frontend-auth-client.svg)](@edx/frontend-auth)
[![npm_downloads](https://img.shields.io/npm/dt/@edx/frontend-auth-client.svg)](@edx/frontend-auth)
[![license](https://img.shields.io/npm/l/@edx/frontend-auth-client.svg)](@edx/frontend-auth)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)


frontend-auth simplifies the process of making authenticated API requests to backend edX services by providing common authN/authZ client code that enables the login/logout flow and handles ensuring the presence of a valid [JWT cookie](https://github.com/edx/edx-platform/blob/master/openedx/core/djangoapps/oauth_dispatch/docs/decisions/0009-jwt-in-session-cookie.rst).

## Usage

To install frontend-auth into your project:

```
npm i --save @edx/frontend-auth-client
```

`frontend-auth` uses [axios interceptors](https://github.com/axios/axios#interceptors) to ensure that a valid JWT cookie exists in your user's browser before making any API requests. If a valid JWT cookie does not exist, it will attempt to obtain a new valid JWT cookie using a refresh token if one exists in cookies. If a refresh token does not exist or the refresh token is not valid the user will be logged out and redirected to a page of your choosing. Instead of referencing axios directly, you should obtain an http client by calling the `getAuthenticatedAPIClient` function provided by `frontend-auth`:

```
import { getAuthenticatedAPIClient } from '@edx/frontend-auth';

const apiClient = getAuthenticatedAPIClient({
  appBaseUrl: process.env.BASE_URL,
  loginUrl: process.env.LOGIN_URL,
  logoutUrl: process.env.LOGOUT_URL,
  refreshAccessTokenEndpoint: process.env.REFRESH_ACCESS_TOKEN_ENDPOINT,
  accessTokenCookieName: process.env.ACCESS_TOKEN_COOKIE_NAME,
  csrfCookieName: process.env.CSRF_COOKIE_NAME,
});
```

`frontend-auth` provides a `PrivateRoute` component which can be used along with `react-router` to require authentication for specific routes in your app. Here is an example of defining a route that requires authentication:

```
<ConnectedRouter history={history}>
  <Switch>
    <Route exact path="/unauthenticated" component={UnauthenticatedComponent} />
    <PrivateRoute
      path="/authenticated"
      component={AuthenticatedComponent}
      authenticatedAPIClient={apiClient}
      redirect={process.env.BASE_URL}  // This should be the base URL of your app.
    />
  </Switch>
</ConnectedRouter>
```
