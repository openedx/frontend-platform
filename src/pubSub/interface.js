import PropTypes from 'prop-types';

const serviceShape = {
  subscribe: PropTypes.func.isRequired,
  unsubscribe: PropTypes.func.isRequired,
};

let service = null;

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

export function getPubSubService() {
  if (!service) {
    throw Error('You must first configure the pub/sub service.');
  }

  return service;
}

export function resetPubSubService() {
  service = null;
}
