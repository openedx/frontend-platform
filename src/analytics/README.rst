frontend-analytics
==================

|Build Status| |Coveralls| |npm_version| |npm_downloads| |license|
|semantic-release|

frontend-analytics contains a shared interface for tracking events. At this time, it supports Segment and the Tracking Log API (hosted in LMS).

Usage
-----

To install frontend-analytics into your project::

    npm i --save @edx/frontend-analytics

Add the following configuration code to your app::

    import { configure as configureAnalytics, SegmentAnalyticsService } from '@edx/frontend-platform/analytics';
    import { getLoggingService } from '@edx/frontend-platform/logging';
    import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
    import { getConfigService } from '@edx/frontend-platform/config';

    configureAnalytics(SegmentAnalyticsService, {
      loggingService: getLoggingService(),
      httpClient: getAuthenticatedHttpClient(),
      config: { ... },
    });

.. |Build Status| image:: https://api.travis-ci.org/edx/frontend-analytics.svg?branch=master
   :target: https://travis-ci.org/edx/frontend-analytics
.. |Coveralls| image:: https://img.shields.io/coveralls/edx/frontend-analytics.svg?branch=master
   :target: https://coveralls.io/github/edx/frontend-analytics
.. |npm_version| image:: https://img.shields.io/npm/v/@edx/frontend-analytics.svg
   :target: @edx/frontend-analytics
.. |npm_downloads| image:: https://img.shields.io/npm/dt/@edx/frontend-analytics.svg
   :target: @edx/frontend-analytics
.. |license| image:: https://img.shields.io/npm/l/@edx/frontend-analytics.svg
   :target: @edx/frontend-analytics
.. |semantic-release| image:: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
   :target: https://github.com/semantic-release/semantic-release
