import PropTypes from 'prop-types';
import PubSubJsService from './PubSubJsService';

const serviceShape = {
  subscribe: PropTypes.func.isRequired,
  unsubscribe: PropTypes.func.isRequired,
  publish: PropTypes.func.isRequired,
};

let service = new PubSubJsService();

export function configure(PubSubService) {
  PropTypes.checkPropTypes(serviceShape, service, 'property', 'PubSubService');
  service = new PubSubService();
}

export function subscribe(type, callback) {
  return service.subscribe(type, callback);
}

export function unsubscribe(token) {
  return service.unsubscribe(token);
}

export function publish(type, data) {
  return service.publish(type, data);
}

export function getPubSubService() {
  if (!service) {
    throw Error('You must first configure the pub/sub service.');
  }

  return service;
}

export function resetPubSubService() {
  service = null;
}
