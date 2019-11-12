import PropTypes from 'prop-types';

let service = null;

export default function configure(PubSubService, services) {
  service = new PubSubService(services);
  PropTypes.checkPropTypes({
    subscribe: PropTypes.func.isRequired,
    unsubscribe: PropTypes.func.isRequired,
  }, service, 'property', 'PubSubService');
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
