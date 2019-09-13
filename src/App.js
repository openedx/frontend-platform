import PubSub from 'pubsub-js';
import { createBrowserHistory } from 'history';
import memoize from 'lodash.memoize';
import pick from 'lodash.pick';

import getQueryParameters from './getQueryParameters';
import { defaultAuthentication } from './frontendAuthWrapper';
import validateConfig from './validateConfig';

export const APP_TOPIC = 'APP';
export const APP_READY = `${APP_TOPIC}.READY`;
export const APP_ERROR = `${APP_TOPIC}.ERROR`;

/* eslint no-underscore-dangle: "off" */
export default class App {
  static _config = null;
  static _apiClient = null;
  static history = createBrowserHistory();
  static authentication = defaultAuthentication;
  static getQueryParams = memoize(getQueryParameters);

  static set config(newConfiguration) {
    validateConfig(newConfiguration, 'App');
    this._config = newConfiguration;
  }

  static get config() {
    if (this._config === null) {
      throw new Error('App.config has not been initialized. Are you calling it too early?');
    }
    return this._config;
  }

  static subscribe(type, callback) {
    PubSub.subscribe(type, callback);
  }

  static ready() {
    PubSub.publish(APP_READY);
  }

  static error(error) {
    PubSub.publish(APP_ERROR, error);
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

  static get queryParams() {
    return this.getQueryParams(global.location.search);
  }

  static requireConfig(keys, requester) {
    keys.forEach((key) => {
      if (this.config[key] === undefined) {
        throw new Error(`App configuration error: ${key} is required by ${requester}.`);
      }
    });

    return pick(this.config, keys);
  }

  static reset() {
    this._config = null;
    this._apiClient = null;
    this._error = null;
    this.authentication = defaultAuthentication;
    PubSub.unsubscribe(APP_TOPIC);
  }
}
