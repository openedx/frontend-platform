frontend-i18n
================

|Build Status| |Coveralls| |npm_version| |npm_downloads| |license| |semantic-release|

frontend-i18n contains a shared interface for internationalizing and localizing frontend code.

Installation
------------

To install frontend-i18n into your project::

    npm i --save @edx/frontend-i18n


Configuration
-------------

The frontend-i18n library needs to be configured on application initialization.  The configure() function
takes two arguments, a configuration object and a messages object.

Example of messages object::

  import arMessages from './messages/ar.json';
  import es419Messages from './messages/es_419.json';

  const messages = {
    ar: arMessages,
    // 'en' should not be included here, as it is the default/fallback language.
    'es-419': es419Messages,
  };

Example of es_419.json messages JSON file::

  {
    "siteheader.links.courses": "Cursos",
    "siteheader.links.programs": "Programas y Titulos",
  }

Configuration Example::

  import { configure as configureI18n } from '@edx/frontend-i18n';

  // frontend-i18n relies on two pieces of configuration.
  const configuration = {
    ENVIRONMENT: 'production',
    LANGUAGE_PREFERENCE_COOKIE_NAME: 'openedx-language-preference'
  }
  const messages = {
    ar: require('./messages/ar.json')
    // ... other languages ...
  }
  configureI18n(configuration, messages);

Exports
-------

Note: Better documentation forthcoming.  In the meantime, if you have any questions, please contact @edx/arch-team

Core functionality:

- configure
- getPrimaryLanguageSubtag
- getLocale
- getMessages
- isRtl
- handleRtl
- localeSortFunction

From 'react-intl':

- intlShape
- FormattedMessage
- defineMessages
- IntlProvider
- injectIntl

Actions:

- setLocale

Reducers:

- reducer

Selectors:

- localeSelector

Localized country lists:

- getCountryList
- getCountryMessages

Localized language lists:

- getLanguageList
- getLanguageMessages

.. |Build Status| image:: https://api.travis-ci.org/edx/frontend-i18n.svg?branch=master
   :target: https://travis-ci.org/edx/frontend-i18n
.. |Coveralls| image:: https://img.shields.io/coveralls/edx/frontend-i18n.svg?branch=master
   :target: https://coveralls.io/github/edx/frontend-i18n
.. |npm_version| image:: https://img.shields.io/npm/v/@edx/frontend-i18n.svg
   :target: @edx/frontend-i18n
.. |npm_downloads| image:: https://img.shields.io/npm/dt/@edx/frontend-i18n.svg
   :target: @edx/frontend-i18n
.. |license| image:: https://img.shields.io/npm/l/@edx/frontend-i18n.svg
   :target: @edx/frontend-i18n
.. |semantic-release| image:: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
   :target: https://github.com/semantic-release/semantic-release
