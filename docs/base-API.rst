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
- `API Helpers`_
   - `camelCaseObject(object)`_
   - `snakeCaseObject(object)`_
   - `convertKeyNames(object, nameMap)`_
   - `modifyObjectKeys(object, modify)`_
- `App Initialization Lifecycle Phases`_
   - `beforeInit`_
   - `loadConfig`_
   - `logging`_
   - `auth`_
   - `i18n`_
   - `analytics`_
   - `beforeReady`_
   - `ready`_
   - `error`_




overrideHandlers
^^^^^^^^^^^^^^^^

An optional object of ``overrideHandlers`` which can be used to replace
the default behavior of any part of the startup sequence. It can also be
used to add additional initialization behavior before or after the rest
of the sequence.

An example in which we override the auth handling:

::

   App.initialize({
     overrideHandlers: {
       auth: (app) => {
         // As a usage example of overriding one phase of the startup sequence,
         // providing this function will override the default auth
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
-  auth
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

``LoginRedirect``
-----------------

``LoginRedirect`` is a React component that, when rendered, redirects to the login page as a side effect.

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

auth
~~~~

Event constant: ``APP_AUTHENTICATED``

The ``auth`` phase creates an authenticated apiClient and
makes it available at ``App.apiClient`` on the ``App`` singleton. It
also runs ``getAuthenticatedUser`` from @edx/frontend-auth and will
redirect to the login experience if the user does not have a valid
auth cookie and the ``requireAuthenticatedUser``
option is set to true. Finally, it will make authenticated user
information available at ``App.authenticatedUser`` for later use by the
application.

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
