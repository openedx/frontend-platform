import PubSub from 'pubsub-js';
import memoize from 'lodash.memoize';
import pick from 'lodash.pick';

import getQueryParameters from './getQueryParameters';
import { defaultAuthenticatedUser } from './frontendAuthWrapper';
import * as handlers from './handlers';
import validateConfig from './validateConfig';
import env from './env';

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

/* eslint no-underscore-dangle: "off" */
export default class App {
  static _config = env;
  static _apiClient = null;
  static history = null;
  static authenticatedUser = defaultAuthenticatedUser;
  static decodedAccessToken = null;
  static getQueryParams = memoize(getQueryParameters);
  static error = null;

  static async initialize({
    messages,
    overrideHandlers = {},
    loggingService,
    ...custom
  } = {}) {
    validateConfig(this._config, 'App environment config validation handler');

    try {
      await this._override(handlers.beforeInit, overrideHandlers.beforeInit);
      PubSub.publish(APP_BEFORE_INIT);

      this.messages = messages;
      this.loggingService = loggingService;
      this.custom = custom;

      // Configuration
      await this._override(handlers.configuration, overrideHandlers.configuration);
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

  static set config(newConfiguration) {
    validateConfig(newConfiguration, 'App configuration setter');
    this._config = newConfiguration;
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
    PubSub.subscribe(type, callback);
  }

  static get queryParams() {
    return this.getQueryParams(global.location.search);
  }

  static requireConfig(keys, requester = 'unspecified application code') {
    keys.forEach((key) => {
      if (this.config[key] === undefined) {
        throw new Error(`App configuration error: ${key} is required by ${requester}.`);
      }
    });

    return pick(this.config, keys);
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
    this.authenticatedUser = defaultAuthenticatedUser;
    PubSub.unsubscribe(APP_TOPIC);
  }
}
