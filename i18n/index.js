/**
 * #### Import members from **@edx/frontend-platform/i18n**
 * The i18n module relies on react-intl and re-exports all of that package's exports.
 *
 * For each locale we want to support, react-intl needs 1) the locale-data, which includes
 * information about how to format numbers, handle plurals, etc., and 2) the translations, as an
 * object holding message id / translated string pairs.  A locale string and the messages object are
 * passed into the IntlProvider element that wraps your element hierarchy.
 *
 * Note that react-intl has no way of checking if the translations you give it actually have
 * anything to do with the locale you pass it; it will happily use whatever messages object you pass
 * in.  However, if the locale data for the locale you passed into the IntlProvider was not
 * correctly installed with addLocaleData, all of your translations will fall back to the default
 * (in our case English), *even if you gave IntlProvider the correct messages object for that
 * locale*.
 *
 * Messages are provided to this module via the configure() function below.
 *
 *
 * @module Internationalization
 * @see {@link https://github.com/edx/frontend-platform/blob/master/docs/how_tos/i18n.rst}
 * @see {@link https://github.com/formatjs/react-intl/blob/master/docs/Components.md|React Intl} for components exported from this module.
 *
 */

/**
 * @name FormattedDate
 * @kind class
 * @see {@link https://github.com/formatjs/react-intl/blob/master/docs/Components.md#formatteddate|React Intl}
 */

/**
 * @name FormattedTime
 * @kind class
 * @see {@link https://github.com/formatjs/react-intl/blob/master/docs/Components.md#formatteddate|React Intl}
 */

/**
 * @name FormattedRelative
 * @kind class
 * @see {@link https://github.com/formatjs/react-intl/blob/master/docs/Components.md#formattedrelative|React Intl}
 */

/**
 * @name FormattedNumber
 * @kind class
 * @see {@link https://github.com/formatjs/react-intl/blob/master/docs/Components.md#formattednumber|React Intl}
 */

/**
 * @name FormattedPlural
 * @kind class
 * @see {@link https://github.com/formatjs/react-intl/blob/master/docs/Components.md#formattedplural|React Intl}
 */

/**
 * @name FormattedMessage
 * @kind class
 * @see {@link https://github.com/formatjs/react-intl/blob/master/docs/Components.md#formattedmessage|React Intl}
 */

/**
 * @name IntlProvider
 * @kind class
 * @see {@link https://github.com/formatjs/react-intl/blob/master/docs/Components.md#intlprovider|React Intl}
 */

/**
 * @name intlShape
 * @kind constant
 * @see {@link https://github.com/formatjs/react-intl/blob/master/docs/API.md#intlshape|React Intl}
 */

/**
 * @name defineMessages
 * @kind function
 * @see {@link https://github.com/formatjs/react-intl/blob/master/docs/API.md#definemessages|React Intl}
 */
export { intlShape, FormattedDate, FormattedTime, FormattedRelative, FormattedNumber, FormattedPlural, FormattedMessage, defineMessages, IntlProvider } from 'react-intl';
export { configure, getPrimaryLanguageSubtag, getLocale, getMessages, isRtl, handleRtl, LOCALE_CHANGED, LOCALE_TOPIC } from './lib';
export { default as injectIntl } from './injectIntlWithShim';
export { getCountryList, getCountryMessages } from './countries';
export { getLanguageList, getLanguageMessages } from './languages';
//# sourceMappingURL=index.js.map