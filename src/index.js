/**
 * Here you can find the core functionality of `frontend-platform`, which you
 * can import directly. For example:
 * ```js
 * import { getConfig } from "@openedx/frontend-platform";
 * ```
 * Other functionality is split into modules, which you import separately, e.g.
 * i18n functionality can be imported from "@openedx/frontend-platform/i18n".
 *
 * @module Core
 *
 */

export {
  modifyObjectKeys,
  camelCaseObject,
  snakeCaseObject,
  convertKeyNames,
  getQueryParameters,
  ensureDefinedConfig,
  parseURL,
  getPath,
} from './utils.js';
export {
  APP_TOPIC,
  APP_PUBSUB_INITIALIZED,
  APP_CONFIG_INITIALIZED,
  APP_AUTH_INITIALIZED,
  APP_I18N_INITIALIZED,
  APP_LOGGING_INITIALIZED,
  APP_ANALYTICS_INITIALIZED,
  APP_READY,
  APP_INIT_ERROR,
  CONFIG_TOPIC,
  CONFIG_CHANGED,
} from './constants.js';
export {
  initialize,
  history,
  initError,
  auth,
} from './initialize.js';
export {
  publish,
  subscribe,
  unsubscribe,
} from './pubSub.js';
export {
  getConfig,
  setConfig,
  mergeConfig,
  ensureConfig,
} from './config.js';
export {
  initializeMockApp,
  mockMessages,
} from './testing/index.js';

// Export types too - required for interfaces to be documented by TypeDoc:
/** @typedef {import('./config.js').ConfigDocument} ConfigDocument */
