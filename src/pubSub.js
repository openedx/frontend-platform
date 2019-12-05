import PubSub from 'pubsub-js';

/**
 *
 *
 * @param {*} type
 * @param {*} callback
 * @returns {string} A subscription token that can be passed to unsubscribe
 */
export function subscribe(type, callback) {
  return PubSub.subscribe(type, callback);
}

/**
 *
 *
 * @param {*} token
 */
export function unsubscribe(token) {
  return PubSub.unsubscribe(token);
}

/**
 *
 *
 * @param {*} type
 * @param {*} data
 */
export function publish(type, data) {
  return PubSub.publish(type, data);
}
