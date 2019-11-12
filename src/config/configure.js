import PropTypes from 'prop-types';

let service = null;

export default function configure(ConfigService, services) {
  service = new ConfigService(services);
  PropTypes.checkPropTypes({
    getConfig: PropTypes.func.isRequired,
    setConfig: PropTypes.func.isRequired,
    mergeConfig: PropTypes.func.isRequired,
  }, service, 'property', 'ConfigService');
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
  return service;
}
