import PubSub from 'pubsub-js';

export function subscribe(type, callback) {
  return PubSub.subscribe(type, callback);
}

export function unsubscribe(token) {
  return PubSub.unsubscribe(token);
}

export function publish(type, data) {
  return PubSub.publish(type, data);
}
