/**
 * The i18n module relies on react-intl and re-exports all of that package's exports.
 *
 * @module I18n
 *
 *
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
