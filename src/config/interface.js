import PropTypes from 'prop-types';
import ProcessEnvConfigService from './ProcessEnvConfigService';

import { APP_CONFIG_INITIALIZED } from '../init';
import { publish, subscribe } from '../pubSub';

export const CONFIG_TOPIC = 'CONFIG';
export const CONFIG_CHANGED = `${CONFIG_TOPIC}.CHANGED`;

let service = new ProcessEnvConfigService();

const serviceShape = {
  getConfig: PropTypes.func.isRequired,
  setConfig: PropTypes.func.isRequired,
  mergeConfig: PropTypes.func.isRequired,
};

export function configure(ConfigService) {
  service = new ConfigService();
  PropTypes.checkPropTypes(serviceShape, service, 'property', 'ConfigService');
  return service;
}

export function getConfig() {
  return service.getConfig();
}

export function setConfig(config) {
  service.setConfig(config);
  publish(CONFIG_CHANGED);
}

export function mergeConfig(config) {
  service.mergeConfig(config);
  publish(CONFIG_CHANGED);
}

export function getConfigService() {
  if (!service) {
    throw Error('You must first configure the config service.');
  }

  return service;
}

export function resetConfigService() {
  service = null;
}

export function ensureConfig(keys, requester = 'unspecified application code') {
  subscribe(APP_CONFIG_INITIALIZED, () => {
    keys.forEach((key) => {
      if (service.getConfig()[key] === undefined) {
        throw new Error(`App configuration error: ${key} is required by ${requester}.`);
      }
    });
  });
}
