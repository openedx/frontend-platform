frontend-logging
================

|Build Status| |Coveralls| |npm_version| |npm_downloads| |license| |semantic-release|

frontend-logging contains a shared interface for logging errors and event to New Relic.

Usage
-----

To install frontend-logging into your project::

    npm i --save @edx/frontend-logging

To configure the logging service::

    import { configureLoggingService, NewRelicLoggingService } from '@edx/frontend-logging';

    // configure with any concrete implementation that implements the expected interface
    configureLoggingService(NewRelicLoggingService);

To use the configured logging service::

    import { logApiClientError, logInfo, logError } from '@edx/frontend-logging';

    logInfo(message);
    logApiClientError(e, customAttributes);  // handles errors or axios error responses
    logError(e);

NewRelicLoggingService
----------------------

The NewRelicLoggingService is a concrete implementation of the logging service interface that sends messages to NewRelic that can be seen in NewRelic Browser and NewRelic Insights. When in development mode, all messages will instead be sent to the console.

When you use ``logError`` or ``logApiClientError``, your errors will appear under "JS errors" for your Browser application.

Additionally, when you use `logApiClientError`, you get some additional custom metrics for Axios error responses. To see those details, you can use a New Relic Insights query like the following::

    SELECT * from JavaScriptError WHERE errorStatus is not null SINCE 10 days ago

When using ``logInfo``, these only appear in New Relic Insights when querying for page actions as follows::

    SELECT * from PageAction WHERE actionName = 'INFO' SINCE 1 hour ago

You can also add your own custom metrics as an additional argument, or see the code to find other standard custom attributes.


.. |Build Status| image:: https://api.travis-ci.org/edx/frontend-logging.svg?branch=master
   :target: https://travis-ci.org/edx/frontend-logging
.. |Coveralls| image:: https://img.shields.io/coveralls/edx/frontend-logging.svg?branch=master
   :target: https://coveralls.io/github/edx/frontend-logging
.. |npm_version| image:: https://img.shields.io/npm/v/@edx/frontend-logging.svg
   :target: @edx/frontend-logging
.. |npm_downloads| image:: https://img.shields.io/npm/dt/@edx/frontend-logging.svg
   :target: @edx/frontend-logging
.. |license| image:: https://img.shields.io/npm/l/@edx/frontend-logging.svg
   :target: @edx/frontend-logging
.. |semantic-release| image:: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
   :target: https://github.com/semantic-release/semantic-release
