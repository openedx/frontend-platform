import PubSub from 'pubsub-js';
import memoize from 'lodash.memoize';

import getQueryParameters from './data/getQueryParameters';
import * as handlers from './handlers';
import validateConfig from './data/validateConfig';
import env from './data/env';

export const APP_TOPIC = 'APP';
export const APP_BEFORE_INIT = `${APP_TOPIC}.BEFORE_INIT`;
export const APP_CONFIG_LOADED = `${APP_TOPIC}.CONFIGURED`;
export const APP_AUTHENTICATED = `${APP_TOPIC}.AUTHENTICATED`;
export const APP_I18N_CONFIGURED = `${APP_TOPIC}.I18N_CONFIGURED`;
export const APP_LOGGING_CONFIGURED = `${APP_TOPIC}.LOGGING_CONFIGURED`;
export const APP_ANALYTICS_CONFIGURED = `${APP_TOPIC}.ANALYTICS_CONFIGURED`;
export const APP_BEFORE_READY = `${APP_TOPIC}.BEFORE_READY`;
export const APP_READY = `${APP_TOPIC}.READY`;
export const APP_ERROR = `${APP_TOPIC}.ERROR`;

export const AUTHENTICATED_USER_TOPIC = 'AUTHENTICATED_USER';
export const AUTHENTICATED_USER_CHANGED = `${AUTHENTICATED_USER_TOPIC}.CHANGED`;

export const CONFIG_TOPIC = 'CONFIG';
export const CONFIG_CHANGED = `${CONFIG_TOPIC}.CHANGED`;

/* eslint no-underscore-dangle: "off" */
export default class App {
  static _config = env;
  static _apiClient = null;
  static requireAuthenticatedUser = false;
  static hydrateAuthenticatedUser = false;
  static history = null;
  static _authenticatedUser = null;
  static decodedAccessToken = null;
  static getQueryParams = memoize(getQueryParameters);
  static error = null;

  static async initialize({
    requireAuthenticatedUser = false,
    hydrateAuthenticatedUser = false,
    loggingService,
    messages,
    overrideHandlers = {},
    ...custom
  } = {}) {
    validateConfig(this._config, 'App environment config validation handler');

    try {
      await this._override(handlers.beforeInit, overrideHandlers.beforeInit);
      PubSub.publish(APP_BEFORE_INIT);

      this.requireAuthenticatedUser = requireAuthenticatedUser;
      this.hydrateAuthenticatedUser = hydrateAuthenticatedUser;
      this.messages = messages;
      this.loggingService = loggingService;
      this.custom = custom;

      // Configuration
      await this._override(handlers.loadConfig, overrideHandlers.loadConfig);
      PubSub.publish(APP_CONFIG_LOADED);

      // Logging
      await this._override(handlers.logging, overrideHandlers.logging);
      PubSub.publish(APP_LOGGING_CONFIGURED);

      // Authentication
      await this._override(handlers.authentication, overrideHandlers.authentication);
      PubSub.publish(APP_AUTHENTICATED);

      // Internationalization
      await this._override(handlers.i18n, overrideHandlers.i18n);
      PubSub.publish(APP_I18N_CONFIGURED);

      // Analytics
      await this._override(handlers.analytics, overrideHandlers.analytics);
      PubSub.publish(APP_ANALYTICS_CONFIGURED);

      // Before Ready
      await this._override(handlers.beforeReady, overrideHandlers.beforeReady);
      PubSub.publish(APP_BEFORE_READY);

      // Ready
      await this._override(handlers.ready, overrideHandlers.ready);
      PubSub.publish(APP_READY);
    } catch (e) {
      // Error
      this.error = e;
      await this._override(handlers.error, overrideHandlers.error);
      PubSub.publish(APP_ERROR, e);
    }
  }

  static set authenticatedUser(newAuthenticatedUser) {
    this._authenticatedUser = newAuthenticatedUser;
    PubSub.publish(AUTHENTICATED_USER_CHANGED);
  }

  static get authenticatedUser() {
    return this._authenticatedUser;
  }

  static set config(newConfig) {
    validateConfig(newConfig, 'App configuration setter');
    this._config = newConfig;
    PubSub.publish(CONFIG_CHANGED);
  }

  static get config() {
    return this._config;
  }

  static set apiClient(apiClient) {
    this._apiClient = apiClient;
  }

  static get apiClient() {
    if (this._apiClient === null) {
      throw new Error('App.apiClient has not been initialized. Are you calling it too early?');
    }
    return this._apiClient;
  }

  static subscribe(type, callback) {
    return PubSub.subscribe(type, callback);
  }

  static unsubscribe(token) {
    PubSub.unsubscribe(token);
  }

  static get queryParams() {
    return this.getQueryParams(global.location.search);
  }

  static mergeConfig(newConfig, requester = 'unspecified application code') {
    validateConfig(newConfig, requester);
    this._config = Object.assign(this._config, newConfig);
    PubSub.publish(CONFIG_CHANGED);
  }

  static ensureConfig(keys, requester = 'unspecified application code') {
    this.subscribe(APP_CONFIG_LOADED, () => {
      keys.forEach((key) => {
        if (this.config[key] === undefined) {
          throw new Error(`App configuration error: ${key} is required by ${requester}.`);
        }
      });
    });
  }

  static async _override(defaultHandler, overrideHandler) {
    if (overrideHandler !== undefined) {
      await overrideHandler(this);
    } else {
      await defaultHandler(this);
    }
  }

  static reset() {
    this._config = env;
    this._apiClient = null;
    this._error = null;
    this._authenticatedUser = null;
    PubSub.unsubscribe(APP_TOPIC);
  }
}
