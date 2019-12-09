/**
 * @module PubSub
 */

import PubSub from 'pubsub-js';


/**
 *
 * @memberof PubSub
 * @param {*} type
 * @param {*} callback
 * @returns {string} A subscription token that can be passed to unsubscribe
 */
export function subscribe(type, callback) {
  return PubSub.subscribe(type, callback);
}

/**
 *
 * @memberof PubSub
 * @param {*} token
 */
export function unsubscribe(token) {
  return PubSub.unsubscribe(token);
}

/**
 *
 * @memberof PubSub
 * @param {*} type
 * @param {*} data
 */
export function publish(type, data) {
  return PubSub.publish(type, data);
}
