import PubSub from 'pubsub-js';
import { createBrowserHistory } from 'history';
import memoize from 'lodash.memoize';

import getQueryParameters from './getQueryParameters';
import { defaultAuthentication } from './frontendAuthWrapper';
import validateConfig from './validateConfig';

export const APP_READY = 'APP.READY';
export const APP_ERROR = 'APP.ERROR';

/* eslint no-underscore-dangle: "off" */
export default class App {
  static _config = null;
  static _ready = false;
  static history = createBrowserHistory();
  static authentication = defaultAuthentication;
  static getQueryParameters = memoize(getQueryParameters);

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
    this._ready = true;
    PubSub.publish(APP_READY);
  }

  static error(error) {
    this._ready = false;
    this.error = error;
    PubSub.publish(APP_ERROR);
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
    return getQueryParameters(global.location.search);
  }

  static requireConfig(keys, requester) {
    this.subscribe(APP_READY, () => {
      keys.forEach((key) => {
        if (this.config[key] === undefined) {
          throw new Error(`App configuration error: ${key} is required by ${requester}.`);
        }
      });
    });
  }
}
