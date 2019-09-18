frontend-auth
=============

|Build Status| |Coveralls| |npm_version| |npm_downloads| |license| |semantic-release|

frontend-auth simplifies the process of making authenticated API requests to backend edX services by providing common authN/authZ client code that enables the login/logout flow and handles ensuring the presence of a valid `JWT cookie <https://github.com/edx/edx-platform/blob/master/openedx/core/djangoapps/oauth_dispatch/docs/decisions/0009-jwt-in-session-cookie.rst>`__.

Usage
-----

To install frontend-auth into your project:

::

   npm i --save @edx/frontend-auth

``frontend-auth`` uses `axios interceptors <https://github.com/axios/axios#interceptors>`__ to ensure that a valid JWT cookie exists in your user’s browser before making any API requests. If a valid JWT cookie does not exist, it will attempt to obtain a new valid JWT cookie using a refresh token if one exists in cookies. If a refresh token does not exist or the refresh token is not valid the user will be logged out and redirected to a page of your choosing. Instead of referencing axios directly, you should obtain an http client by calling the ``getAuthenticatedAPIClient`` function provided by ``frontend-auth``:

::

   import { NewRelicLoggingService } from '@edx/frontend-logging';
   import { getAuthenticatedAPIClient } from '@edx/frontend-auth';

   const apiClient = getAuthenticatedAPIClient({
     appBaseUrl: process.env.BASE_URL,
     loginUrl: process.env.LOGIN_URL,
     logoutUrl: process.env.LOGOUT_URL,
     refreshAccessTokenEndpoint: process.env.REFRESH_ACCESS_TOKEN_ENDPOINT,
     accessTokenCookieName: process.env.ACCESS_TOKEN_COOKIE_NAME,
     loggingService: NewRelicLoggingService, // could be any concrete logging service
     // handleRefreshAccessTokenFailure is an optional callback
     // to handle failures to refresh an access token (the user is likely logged out).
     // If no callback is supplied frontend-auth will redirect the user to login.
     // handleRefreshAccessTokenFailure: error => {},
   });

   apiClient.ensureAuthenticatedUser(window.location.pathname)
     .then(({ authenticatedUser, decodedAccessToken }) => {
        // 1. Successfully resolving the promise means that the user is authenticated and the apiClient is ready to be used.
        // 2. ``authenticatedUser`` is an object containing user account data that was stored in the access token.
        // 3. You probably won't need ``decodedAccessToken``, but it is included for completeness and is the raw version
        //    of the data used to create ``authenticatedUser``.
     });

``frontend-auth`` provides a ``PrivateRoute`` component which can be used along with ``react-router`` to require authentication for specific routes in your app. Here is an example of defining a route that requires authentication:

::

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

``frontend-auth`` also provides Redux actions and a reducer for injecting user profile data into your store.

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
