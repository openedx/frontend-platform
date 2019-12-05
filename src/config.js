import { APP_CONFIG_INITIALIZED } from './initialize';
import { publish, subscribe } from './pubSub';
import { ensureDefinedConfig } from './utils';

export const CONFIG_TOPIC = 'CONFIG';
export const CONFIG_CHANGED = `${CONFIG_TOPIC}.CHANGED`;

const ENVIRONMENT = process.env.NODE_ENV;
let config = {
  ACCESS_TOKEN_COOKIE_NAME: process.env.ACCESS_TOKEN_COOKIE_NAME,
  BASE_URL: process.env.BASE_URL,
  CREDENTIALS_BASE_URL: process.env.CREDENTIALS_BASE_URL,
  CSRF_TOKEN_API_PATH: process.env.CSRF_TOKEN_API_PATH,
  ECOMMERCE_BASE_URL: process.env.ECOMMERCE_BASE_URL,
  ENVIRONMENT,
  LANGUAGE_PREFERENCE_COOKIE_NAME: process.env.LANGUAGE_PREFERENCE_COOKIE_NAME,
  LMS_BASE_URL: process.env.LMS_BASE_URL,
  LOGIN_URL: process.env.LOGIN_URL,
  LOGOUT_URL: process.env.LOGOUT_URL,
  MARKETING_SITE_BASE_URL: process.env.MARKETING_SITE_BASE_URL,
  ORDER_HISTORY_URL: process.env.ORDER_HISTORY_URL,
  REFRESH_ACCESS_TOKEN_ENDPOINT: process.env.REFRESH_ACCESS_TOKEN_ENDPOINT,
  SECURE_COOKIES: ENVIRONMENT !== 'development',
  SEGMENT_KEY: process.env.SEGMENT_KEY,
  SITE_NAME: process.env.SITE_NAME,
  USER_INFO_COOKIE_NAME: process.env.USER_INFO_COOKIE_NAME,
};

/**
 *
 *
 * @returns {Object}
 */
export function getConfig() {
  return config;
}

/**
 *
 *
 * @param {Object} newConfig
 */
export function setConfig(newConfig) {
  ensureDefinedConfig(config, 'config');
  config = newConfig;
  publish(CONFIG_CHANGED);
}

/**
 *
 *
 * @param {Object} newConfig
 */
export function mergeConfig(newConfig) {
  ensureDefinedConfig(newConfig, 'ProcessEnvConfigService');
  config = Object.assign(config, newConfig);
  publish(CONFIG_CHANGED);
}

/**
 *
 *
 * @param {Array} keys
 * @param {string} [requester='unspecified application code']
 */
export function ensureConfig(keys, requester = 'unspecified application code') {
  subscribe(APP_CONFIG_INITIALIZED, () => {
    keys.forEach((key) => {
      if (config[key] === undefined) {
        throw new Error(`App configuration error: ${key} is required by ${requester}.`);
      }
    });
  });
}
