#####################################################################
How to: Convert SnakeCase to CamelCase automatically for API Requests
#####################################################################

Introduction
************

When using the HTTP client from ``@edx/frontend-platform``, you are making an API request to an
Open edX service which requires you to handle snake-cased <-> camelCase conversions manually. The manual conversion quickly gets
tedious, and is error prone if you forget to do it.

Here is how you can configure the HTTP client to automatically convert snake_case <-> camelCase for you.

How do I use configure automatic case conversion?
*************************************************

You want to install `axios-case-converter <https://www.npmjs.com/package/axios-case-converter>`_, and add it
as a middleware when calling ``initialize`` in the consumer::

    import axiosCaseConverter from 'axios-case-converter';

    initialize({
        messages: [],
        requireAuthenticatedUser: true,
        hydrateAuthenticatedUser: true,
        authMiddleware: [axiosCaseConverter],
    });

Or, if you choose to use ``configure`` instead::

    import axiosCaseConverter from 'axios-case-converter';

    configure({
        loggingService: getLoggingService(),
        config: getConfig(),
        options: {
                middleware: [axiosCaseConverter, (client) => axiosRetry(client, { retries: 3 })]
        }
    });

By default the middleware will convert camelCase -> snake_case for payloads, and snake_case -> camelCase for responses.
If you want to customize middleware behavior, i.e. only have responses transformed, you can configure it like this::
    initialize({
        messages: [],
        requireAuthenticatedUser: true,
        hydrateAuthenticatedUser: true,
        authMiddleware: [(client) => axiosCaseConverter(client, {
            // options for the middleware
            ignoreHeaders: true, // don't convert headers
            caseMiddleware: {
                requestInterceptor: (config) => {
                    return config;
                }
            }
        })],
    });

See `axios-case-converter <https://github.com/mpyw/axios-case-converter>`_ for more details on configurations supported by the package.
