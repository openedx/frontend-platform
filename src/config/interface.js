import PropTypes from 'prop-types';

let service = null;

const configShape = {
  pubSubService: PropTypes.shape({
    publish: PropTypes.func.isRequired,
  }),
};

const serviceShape = {
  getConfig: PropTypes.func.isRequired,
  setConfig: PropTypes.func.isRequired,
  mergeConfig: PropTypes.func.isRequired,
};

export function configure(ConfigService, config) {
  PropTypes.checkPropTypes(configShape, config, 'property', 'Config');
  PropTypes.checkPropTypes(serviceShape, service, 'property', 'ConfigService');
  service = new ConfigService(config);
}

export function getConfig() {
  return service.getConfig();
}

export function setConfig(config) {
  return service.setConfig(config);
}

export function mergeConfig(config) {
  return service.mergeConfig(config);
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
