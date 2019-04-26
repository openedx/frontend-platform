frontend-logging
================

|Build Status| |Coveralls| |npm_version| |npm_downloads| |license| |semantic-release|

frontend-logging contains a shared interface for logging errors and event to New Relic.

Usage
-----

To install frontend-logging into your project::

    npm i --save @edx/frontend-logging

To use the logging service, use::

    import LoggingService from '@edx/frontend-logging';

    LoggingService.logAPIErrorResponse(e);

New Relic Browser and Insights
------------------------------

When you use ``logError`` or ``logAPIErrorResponse``, your errors will appear under "JS errors" for your Browser application.

Additionally, when you use `logAPIErrorResponse`, you get some additional custom metrics available you can use in a New Relic Insights query like the following::

    SELECT * from JavaScriptError WHERE errorStatus is not null SINCE 10 days ago

When using ``logInfo``, these only appear in New Relic Insights when querying for page actions as follows::

    SELECT * from PageAction WHERE actionName = 'INFO' SINCE 1 hour ago

You can also add your own custom metrics, or see the code to find other standard custom attributes.


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
