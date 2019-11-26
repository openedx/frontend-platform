frontend-platform
=================

|Build Status| |Codecov| |NPM Version| |npm_downloads| |license|
|semantic release|

Overview
--------

frontend-platform is a modest application framework for Open edX micro-frontend applications and their supporting libraries. It provides a number of foundational services that all Open edX micro-frontends should have:

- Analytics
- Authentication
- Internationalization (i18n)
- Logging

In addition, frontend-platform provides an extensible application initialization lifecycle to help manage the configuration of the above services, freeing application developers to focus on feature development.  

Architecture
------------

The four foundational services listed above (analytics, auth, i18n, and logging) are provided as imports to applications via frontend-platform's API layer.  The initialization sequence creates an instance of each service and exposes its methods as functional exports, creating a layer of abstraction between service implementations and their usage in application code.

Each type of service has a documented API contract which service implementations must fulfill. This allows different service implementations to be used as necessary without updates to consuming applications.

.. |Build Status| image:: https://api.travis-ci.org/edx/frontend-platform.svg?branch=master
   :target: https://travis-ci.org/edx/frontend-platform
.. |Codecov| image:: https://img.shields.io/codecov/c/github/edx/frontend-platform
   :target: https://codecov.io/gh/edx/frontend-platform
.. |NPM Version| image:: https://img.shields.io/npm/v/@edx/frontend-platform.svg
   :target: https://www.npmjs.com/package/@edx/frontend-platform
.. |npm_downloads| image:: https://img.shields.io/npm/dt/@edx/frontend-platform.svg
   :target: https://www.npmjs.com/package/@edx/frontend-platform
.. |license| image:: https://img.shields.io/npm/l/@edx/frontend-platform.svg
   :target: https://github.com/edx/frontend-platform/blob/master/LICENSE
.. |semantic release| image:: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
   :target: https://github.com/semantic-release/semantic-release
