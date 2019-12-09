/**
 * The i18n module relies on react-intl and re-exports all of that package's exports.
 *
 * @module I18n
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

export {
  intlShape,
  FormattedDate,
  FormattedTime,
  FormattedRelative,
  FormattedNumber,
  FormattedPlural,
  FormattedMessage,
  defineMessages,
  IntlProvider,
} from 'react-intl';

export {
  configure,
  getPrimaryLanguageSubtag,
  getLocale,
  getMessages,
  isRtl,
  handleRtl,
  LOCALE_CHANGED,
  LOCALE_TOPIC,
} from './lib';

export {
  default as injectIntl,
} from './injectIntlWithShim';

export {
  getCountryList,
  getCountryMessages,
} from './countries';

export {
  getLanguageList,
  getLanguageMessages,
} from './languages';

export { setLocale } from './actions';
export { default as reducer } from './reducers';
export { localeSelector } from './selectors';
