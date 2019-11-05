frontend-auth
=============

|Build Status| |Coveralls| |npm_version| |npm_downloads| |license| |semantic-release|

frontend-auth simplifies the process of making authenticated API requests to backend edX services by providing common authN/authZ client code that enables the login/logout flow and handles ensuring the presence of a valid `JWT cookie <https://github.com/edx/edx-platform/blob/master/openedx/core/djangoapps/oauth_dispatch/docs/decisions/0009-jwt-in-session-cookie.rst>`__.

For detailed usage information `read the API doc <docs/api.md>`__

Usage
-----

To install frontend-auth into your project:

::

   npm i --save @edx/frontend-auth

``frontend-auth`` uses `axios interceptors <https://github.com/axios/axios#interceptors>`__ to ensure that a valid JWT cookie exists in your user’s browser before making any API requests. If a valid JWT cookie does not exist, it will attempt to refresh the JWT cookie. Instead of referencing axios directly, you should obtain an http client by calling the ``getAuthenticatedApiClient`` function provided by ``frontend-auth``:

::

  import { getAuthenticatedApiClient } from '@edx/frontend-auth';

  const apiClient = getAuthenticatedApiClient({
    appBaseUrl: process.env.BASE_URL,
    loginUrl: process.env.LOGIN_URL,
    logoutUrl: process.env.LOGOUT_URL,
    refreshAccessTokenEndpoint: process.env.REFRESH_ACCESS_TOKEN_ENDPOINT,
    accessTokenCookieName: process.env.ACCESS_TOKEN_COOKIE_NAME,
    csrfTokenApiPath: process.env.CSRF_TOKEN_API_PATH,
    loggingService: configuredLoggingService, // see @edx/frontend-logging
  });

  apiClient.get('https://edx.org/api/v1/user).then((response) => {});

When bootstrapping an application it may be useful to get the user's access token data from the jwt cookie. This can be done using `getAuthenticatedUser` or `ensureAuthenticatedUser`.

::

  import { getAuthenticatedUser, ensureAuthenticatedUser } from '@edx/frontend-auth';

  apiClient.getAuthenticatedUser()
    .then((authenticatedUserAccessToken) => {
      // If the authenticatedUserAccessToken is null it means the user is not logged in.
    })
    .catch(e => {
      // There was an unexpected problem
    });

  apiClient.ensureAuthenticatedUser(window.location.pathname)
    .then((authenticatedUserAccessToken) => {
      // If the authenticatedUserAccessToken is null it means the user is not logged in and
      // will be redirected to login.
    })
    .catch(e => {
      // There was an unexpected problem
    });

``frontend-auth`` provides a ``PrivateRoute`` component which can be used along with ``react-router`` to require authentication for specific routes in your app. Here is an example of defining a route that requires authentication:

::

   <ConnectedRouter history={history}>
     <Switch>
       <Route exact path="/unauthenticated" component={UnauthenticatedComponent} />
       <PrivateRoute
         path="/authenticated"
         component={AuthenticatedComponent}
         redirect={process.env.BASE_URL}  // This should be the base URL of your app.
       />
     </Switch>
   </ConnectedRouter>

``frontend-auth`` also provides Redux actions and a reducer for injecting user profile data into your store.

Doc Generation
--------------

The docs at `docs/api.md <docs/api.md>`__ are generated using JSDoc. Run `npm run docs` to regenerate them.

.. |Build Status| image:: https://api.travis-ci.org/edx/frontend-auth.svg?branch=master
   :target: https://travis-ci.org/edx/frontend-auth
.. |Coveralls| image:: https://img.shields.io/coveralls/edx/frontend-auth.svg?branch=master
   :target: https://coveralls.io/github/edx/frontend-auth
.. |npm_version| image:: https://img.shields.io/npm/v/@edx/frontend-auth.svg
   :target: @edx/frontend-auth
.. |npm_downloads| image:: https://img.shields.io/npm/dt/@edx/frontend-auth.svg
   :target: @edx/frontend-auth
.. |license| image:: https://img.shields.io/npm/l/@edx/frontend-auth.svg
   :target: @edx/frontend-auth
.. |semantic-release| image:: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
   :target: https://github.com/semantic-release/semantic-release
