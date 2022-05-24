Middleware Support for HTTP clients
===================================

Status
------

Accepted

Context
-------

We currently expose HTTP clients(axios instances) via ``getAuthenticatedHttpClient`` and ``getHttpClient`` used to make API requests
in our MFEs. There are instances where it would be helpful if consumers could apply middleware to these clients.
For example the `axios-case-converter <https://www.npmjs.com/package/axios-case-converter>`_ package provides
a middleware that handles snake-cased <-> camelCase conversions via axios interceptors. This middleware would allow our MFEs to
avoid having to do this conversion manually.

Decision
--------

The ``initialize`` function provided in the initialize module initializes the ``AxiosJwtAuthService`` provided by ``@edx/frontend-platform``.
We will add an optional param ``authMiddleware``, an array of middleware functions that will be applied to all http clients in
the ``AxiosJwtAuthService``.

Consumers will install the middleware they want to use and provide it to ``initialize``::

    initialize({
        messages: [appMessages],
        requireAuthenticatedUser: true,
        hydrateAuthenticatedUser: true,
        authMiddleware: [axiosCaseConverter, (client) => axiosRetry(client, { retries: 3 })],
    });

If a consumer chooses not to use ``initialize`` and instead the ``configure`` function, the middleware can be passed in the options param::

   configure({
       loggingService: getLoggingService(),
       config: getConfig(),
       options: {
            middleware: [axiosCaseConverter, (client) => axiosRetry(client, { retries: 3 })]
       }
    });

We decided to let consumers install their own middleware packages, removing the need to install the dependency as part of ``@edx/frontend-platform``.
