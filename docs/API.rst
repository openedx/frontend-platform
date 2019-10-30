API Reference
=============

- `App`_
   - `App.history`_
   - `App.authenticatedUser`_
   - `App.decodedAccessToken`_
   - `App.error`_
   - `App.initialize(options)`_
   - `App.config`_
   - `App.apiClient`_
   - `App.subscribe(type, callback)`_
   - `App.mergeConfig(newConfig, requester)`_
   - `App.ensureConfig(keys, requester)`_
   - `App.queryParams`_
- `AppProvider`_
- `AppContext`_
- `AuthenticatedRoute`_
- `LoginRedirect`_
- `getAuthenticatedUserAccount`_
- `validateConfig`_
- `App Initialization Lifecycle Phases`_
   - `beforeInit`_
   - `loadConfig`_
   - `logging`_
   - `authentication`_
   - `i18n`_
   - `analytics`_
   - `beforeReady`_
   - `ready`_
   - `error`_


``App``
-------

The ``App`` class is a singleton with static methods. This is so that it
can be used throughout a consuming application merely by importing it:

::

   import { App } from '@edx/frontend-base';

``App`` provides a few different methods and properties:

.. _apphistory:

``App.history``
~~~~~~~~~~~~~~~

The application's browser history object. See the `history
documentation <https://github.com/ReactTraining/history/blob/master/docs/GettingStarted.md>`__
for more information.

.. _appauthenticateduser:

``App.authenticatedUser``
~~~~~~~~~~~~~~~~~~~~~~~~~

A reference to an object containing information about the currently
authenticated user.

::

   {
     userId: <AUTHENTICATED USER's USER ID>,
     username: <AUTHENTICATED USER's USERNAME>,
     roles: [<ROLE ONE>, <ROLE TWO>],
     administrator: <true|false>,
   }

.. _appdecodedaccesstoken:

``App.decodedAccessToken``
~~~~~~~~~~~~~~~~~~~~~~~~~~

For debugging purposes primarily. A reference to an object containing
the raw, decoded JWT access token. This is the snake_case source for the
data in ``App.authenticatedUser``. The schema and contents of the
decoded access token are subject to change - ``App.authenticatedUser``
represents the contract and should be used whenever possible.

.. _apperror:

``App.error``
~~~~~~~~~~~~~

An error object caught by ``App.initialize`` if an error occurred during
initialization. Useful for error handlers. Note: This is not populated
for errors outside of application initialization. It's merely a
convenience to allow ``APP_ERROR`` subscribers and ``error``
overrideHandlers to access the error that put the application in the
error phase.

.. _appinitialize-messages-loggingservice-overridehandlers-custom-:

``App.initialize(options)``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The ``App.initialize`` method takes an options object with the following possible keys:

requireAuthenticatedUser
^^^^^^^^^^^^^^^^^^^^^^^^

If true, turns on automatic login redirection for unauthenticated users.  Defaults to false, meaning that by default the application will allow anonymous/unauthenticated sessions.

hydrateAuthenticatedUser
^^^^^^^^^^^^^^^^^^^^^^^^

If true, makes an API call to the user account endpoint (```${App.config.LMS_BASE_URL}/api/user/v1/accounts/${username}```) to fetch detailed account information for the authenticated user. This data is merged into ```App.authenticatedUser```, overriding any duplicate keys that already exist. Defaults to false, meaning that no additional account information will be loaded.

messages
^^^^^^^^

A frontend-i18n-compatible messages object, or an array of such objects.
If an array is provided, duplicate keys are resolved with the
last-one-in winning.

loggingService
^^^^^^^^^^^^^^

The logging service to be used by @edx/frontend-logging. It defaults to
``NewRelicLoggingService``.

overrideHandlers
^^^^^^^^^^^^^^^^

An optional object of ``overrideHandlers`` which can be used to replace
the default behavior of any part of the startup sequence. It can also be
used to add additional initialization behavior before or after the rest
of the sequence.

An example in which we override the authentication handling:

::

   App.initialize({
     overrideHandlers: {
       authentication: (app) => {
         // As a usage example of overriding one phase of the startup sequence,
         // providing this function will override the default authentication
         // initialization.

         // The 'app' argument is a reference to the App singleton.
       }
     }
   });

``overrideHandlers`` has keys corresponding to the lifecycle events.
Including a key will override and replace the corresponding lifecycle
handler if provided.

Possible keys:

-  beforeInit
-  loadConfig
-  logging
-  authentication
-  i18n
-  analytics
-  beforeReady
-  ready
-  error

Please see Initialization Lifecycle Phases for more information on the
phases responsibilities.

custom
^^^^^^

You probably don't need this. This is an escape valve for customization
of the handlers. The ``custom`` property can be used to attach custom
data to the ``App`` which will be exposed at ``App.custom``. This data
can be used in custom initialization handlers, or elsewhere in the
application as necessary.

Note, if you're using this to provide mutable data to the application,
*strongly* consider using React props, context, or Redux instead.

.. _appconfig:

``App.config``
~~~~~~~~~~~~~~

The environment configuration. Contains the following keys:

-  ACCESS_TOKEN_COOKIE_NAME
-  BASE_URL
-  CREDENTIALS_BASE_URL
-  CSRF_TOKEN_API_PATH
-  ECOMMERCE_BASE_URL
-  ENVIRONMENT
-  LANGUAGE_PREFERENCE_COOKIE_NAME
-  LMS_BASE_URL
-  LOGIN_URL
-  LOGOUT_URL
-  MARKETING_SITE_BASE_URL
-  ORDER_HISTORY_URL
-  REFRESH_ACCESS_TOKEN_ENDPOINT
-  SECURE_COOKIES
-  SEGMENT_KEY
-  SITE_NAME
-  USER_INFO_COOKIE_NAME

If additional, dynamic config is desired, it would be reasonable to add
those keys into ``App.config``.

Note: By default, ``App.config`` is available to be used *immediately*,
even before ``App.initialize`` is called. This is because environment
variable-based config (using process.env) is statically linked into the
application and so is available as soon as the code is loaded by the
browser. See additional notes under ``App.ensureConfig`` below.

.. _appapiclient:

``App.apiClient``
~~~~~~~~~~~~~~~~~

A reference to the @edx/frontend-auth authenticated API Client.

.. _appsubscribetype-callback:

``App.subscribe(type, callback)``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

A method allowing consumers of ``App`` to subscribe to lifecycle events.
``type`` is an event type, as documented in "Initialization Lifecycle
Phases". There are constants for all the event types:

::

   import {
     APP_BEFORE_INIT, APP_CONFIG_LOADED, APP_AUTHENTICATED, APP_I18N_CONFIGURED, APP_LOGGING_CONFIGURED, APP_ANALYTICS_CONFIGURED, APP_BEFORE_READY, APP_READY, APP_ERROR
   } from `@edx/frontend-base`

   App.subscribe(APP_BEFORE_READY, () => {
     // Do something in the beforeReady phase.
   });

.. _apprequireconfigkeys-requester:

``App.mergeConfig(newConfig, requester)``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Merges additional configuration values into ``App.config``.  Will override any values that exist with the same keys.

::

   App.mergeConfig({
     NEW_KEY: 'new value',
     OTHER_NEW_KEY: 'other new value',
   }, 'MySpecialComponent');

If any of the key values are ``undefined``, an error will be thrown.

``App.ensureConfig(keys, requester)``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

A method allowing application code to indicate that particular
``App.config`` keys are required for them to function. Requester is for
informational/error reporting purposes only.

::

   App.ensureConfig(['LMS_BASE_URL', 'LOGIN_URL'], 'MySpecialComponent');

   // Will throw an error with:
   // "App configuration error: LOGIN_URL is required by MySpecialComponent."
   // if LOGIN_URL is undefined, for example.

**NOTE**: ``App.ensureConfig`` waits until ``APP_CONFIG_LOADED`` is published to verify the existence of the specified properties.  If you use one of the properties prior to ``APP_CONFIG_LOADED``, then there is no guarantee that it's been loaded.

.. _appqueryparams:

``App.queryParams``
~~~~~~~~~~~~~~~~~~~

A method which converts the current query string into an object of
key-value pairs and returns it. It is memoized based on the current
query string for efficiency.

``AppProvider``
---------------

``AppProvider`` is a wrapper component for React-based micro-frontends
to initialize a number of common data/context providers.

::

   import { App, AppProvider, APP_READY } from '@edx/frontend-base';

   App.subscribe(APP_READY, () => {
     ReactDOM.render(
       <AppProvider>
         <HelloWorld />
       </AppProvider>
     )
   });

This will provide the following to HelloWorld:

-  An error boundary as described above.
-  An ``AppContext`` provider for React context data.
-  IntlProvider for @edx/frontend-i18n internationalization
-  Optionally a redux ``Provider``. Will only be included if a ``store``
   property is passed to ``AppProvider``.
-  A ``Router`` for react-router.

``AppContext``
---------------

``AppContext`` provides data from ``App`` in a way that React components
can readily consume, even if it's mutable data. ``AppContext`` contains
the following data structure:

::

   {
     authenticatedUser: <THE App.authenticatedUser OBJECT>,
     config: <THE App.config OBJECT>
   }

If the ``App.authenticatedUser`` or ``App.config`` data changes, ``AppContext`` will be updated accordingly and pass those changes onto React components using the context.

``AppContext`` is used in a React application like any other `React
Context <https://reactjs.org/docs/context.html>`__

``AuthenticatedRoute``
----------------------

``AuthenticatedRoute`` can be used when ``requireAuthenticatedUser`` is ``false`` to configure a subset of an application's client-side routes to redirect to login for unauthenticated users.

::

   <AppProvider>
     <Route exact path="/" component={UnauthenticatedPage} />
     <AuthenticatedRoute exact path="/authenticated" component={AuthenticatedPage} />
   </AppProvider>

In the above example, an anonmyous/unauthenticated user navigating to /authenticated will be redirected to the login page.

``LoginRedirect``
-----------------

``LoginRedirect`` is a React component that, when rendered, redirects to the login page as a side effect.

``getAuthenticatedUserAccount``
-------------------------------

This async function is used internally when the ``hydrateAuthenticatedUser`` initialization option is true in order to fetch user account information.  In general, you shouldn't need to use this directly.

``validateConfig``
------------------

The ``validateConfig`` function is a helper for application code to
validate their own environment configuration variables. Provided a
configuration document, it will throw an error if any of the keys are
``undefined``:

::

   import { validateConfig } from '@edx/frontend-base';

   const customConfig = {
     MY_URL: process.env.MY_URL,
   }

   validateConfig(customConfig);

An exception will be thrown if any of the keys in ``customConfig`` are
``undefined``.

App Initialization Lifecycle Phases
-----------------------------------

The following lifecycle phases exist. Their corresponding event
constants are listed. The source code is in ``src/handlers``.

To override a lifecycle event, functions can be provided to
``overrideHandlers`` in ``App.initialize``, documented above. Each
lifecycle handler can be provided as an ``async`` function, or as a
Promise, allowing asynchronous execution as necessary. Note that the
application will *wait* for a phase to be complete before moving on to
the next phase.

The corresponding event types are published immediately *after* the
lifecycle phase has completed. Note that the events are published
asynchronously using the
`pubsub-js <https://github.com/mroderick/PubSubJS>`__ "publish" method.

The lifecycle phases are listed below. Their names correspond to the
keys used in ``overrideHandlers``.

beforeInit
~~~~~~~~~~

Event constant: ``APP_BEFORE_INIT``

The ``beforeInit`` phase has no default behavior. It can be used to
perform actions prior to any of the other phases, but after
``App.initialize`` has validated its environment configuration. If you
want to perform actions prior to validation of the environment
configuration, then write your code before calling ``App.initialize``
itself.

loadConfig
~~~~~~~~~~~~~

Event constant: ``APP_CONFIG_LOADED``

The ``loadConfig`` phase has no default behavior.

The ``loadConfig`` phase can be used to provide dynamic, runtime
configuration prior to the initialization of any other services the
application may need.

logging
~~~~~~~

Event constant: ``APP_LOGGING_CONFIGURED``

The ``logging`` phase initializes the NewRelicLoggingService from
@edx/frontend-logging by default.

authentication
~~~~~~~~~~~~~~

Event constant: ``APP_AUTHENTICATED``

The ``authentication`` phase creates an authenticated apiClient and
makes it available at ``App.apiClient`` on the ``App`` singleton. It
also runs ``ensureAuthenticatedUser`` from @edx/frontend-auth and will
redirect to the login experience if the user does not have a valid
authentication cookie. Finally, it will make authenticated user
information available at ``App.authenticatedUser`` and
``App.decodedAccessToken`` for later use by the application.

Default behavior is to redirect to a login page during this phase if the
user is not authenticated. This effectively means that the library does
not support anonymous users without overrides.

i18n
~~~~

Event constant: ``APP_I18N_CONFIGURED``

The ``i18n`` phase initializes @edx/frontend-i18n with the ``messages``
object provided to ``App.initialize``.

analytics
~~~~~~~~~

Event constant: ``APP_ANALYTICS_CONFIGURED``

The ``analytics`` phase initializes Segment and configures
@edx/frontend-analytics.

beforeReady
~~~~~~~~~~~

Event constant: ``APP_BEFORE_READY``

The ``beforeReady`` phase calls ``identifyAuthenticatedUser`` and ``sendPageEvent`` from @edx/frontend-analytics, establishing that the page has been initialized for a specific user.

ready
~~~~~

Event constant: ``APP_READY``

The ``ready`` phase has no default behavior. This is the phase where an
application's interface would generally be shown to the user.

error
~~~~~

Event constant: ``APP_ERROR``

The ``error`` phase logs (to loggingService) whatever error occurred to
put the app in an error state. This is the phase where an application
would generally show an error message for an unexpected error to the
user.

Note that the error which caused the application to transition to the
``error`` phase is available at ``App.error``. It is also passed as data
to any subscribers to the ``APP_ERROR`` event.
