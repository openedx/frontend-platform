frontend-i18n
=============

|Build Status| |Coveralls| |npm_version| |npm_downloads| |license| |semantic-release|

frontend-i18n contains a shared interface for internationalizing and localizing frontend code.  For detailed soup-to-nuts instructions on internationalizing your React app, see the _HOWTO .

.. _HOWTO: https://github.com/edx/frontend-i18n/blob/master/docs/how_tos/i18n.rst


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

**configure(configObject, messages)**

Configures the i18n library with messages for your application.

The first is the application configuration object.

The second parameter is an object containing messages for each supported locale, indexed by locale name.

Example of second parameter::

  {
    en: {
      "message.key": "Message Value"
    },
    'es-419': {
      "message.key": "Valor del mensaje"
    }
    ...
  }

Logs a warning if it detects a locale it doesn't expect (as defined by the supportedLocales list
above), or if an expected locale is not provided.


**getPrimaryLanguageSubtag**

Some of our dependencies function on primary language subtags, rather than full locales. This function strips a locale down to that first subtag.  Depending on the code, this may be 2 or more characters.

**getLocale([locale])**

Get the locale from the cookie or, failing that, the browser setting.
Gracefully fall back to a more general primary language subtag or to English (en) if we don't support that language. Throws An error if i18n has not yet been configured.

locale (Optional): If a locale is provided, returns the closest supported locale.

**getMessages([locale])**

Returns messages for the provided locale, or the user's preferred locale if no argument is provided.

**isRtl()**

Determines if the provided locale is a right-to-left language.


**handleRtl()**

Handles applying the RTL stylesheet and "dir=rtl" attribute to the html tag if the current locale is a RTL language.


Passthrough components from `react-intl <https://github.com/formatjs/react-intl/wiki/Components>`_.

- **FormattedDate**
- **FormattedHTMLMessage**
- **FormattedMessage**
- **FormattedNumber**
- **FormattedPlural**
- **FormattedRelative**
- **FormattedTime**
- **defineMessages**
- **injectIntl** (shimmed by this library to throw errors instead of crash when non existent message ids are supplied)
- **IntlProvider**
- **intlShape**

Redux Related API:
~~~~~~~~~~~~~~~~~~

**setLocale()**

A redux action creator. It creates an action in the form below::

  {
    type: 'I18N__SET_LOCALE',
    payload: {
      locale: 'the-locale',
    }
  }

**reducer**

The reducer for locale actions.

**localeSelector**

A selector that retrieves the locale when given the redux state.


Localized country lists:
~~~~~~~~~~~~~~~~~~~~~~~~

**getCountryList(locale)**

Provides a list of countries represented as objects of the following shape::

  {
    key, // The ID of the country
    name // The localized name of the country
  }

The list is sorted alphabetically in the current locale. This is useful for select dropdowns primarily.

**getCountryMessages(locale)**

Provides a lookup table of country IDs to country names for the current locale.

Localized language lists:
~~~~~~~~~~~~~~~~~~~~~~~~~

**getLanguageList(locale)**

Provides a lookup table of language IDs to language names for the current locale.

**getLanguageMessages(locale)**

Provides a list of languages represented as objects of the following shape::

  {
    key, // The ID of the language
    name // The localized name of the language
  }

The list is sorted alphabetically in the current locale.
This is useful for select dropdowns primarily.


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
