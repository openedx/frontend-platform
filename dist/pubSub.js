/**
 * #### Import members from **@edx/frontend-platform**
 *
 * The PubSub module is a thin wrapper around the base functionality of
 * [PubSubJS](https://github.com/mroderick/PubSubJS).  For the sake of simplicity and not relying
 * too heavily on implementation-specific features, it maintains a fairly simple API (subscribe,
 * unsubscribe, and publish).
 *
 * Publish/Subscribe events should be used mindfully, especially in relation to application UI
 * frameworks like React.  Given React's unidirectional data flow and prop/state management
 * capabilities, using a pub/sub mechanism is at odds with that framework's best practices.
 *
 * That said, we use pub/sub in our application initialization sequence to allow applications to
 * hook into the initialization lifecycle, and we also use them to publish when the application
 * state has changed, i.e., when the config document or user's authentication state have changed.
 *
 * @module PubSub
 */

import PubSub from 'pubsub-js';

/**
 *
 * @param {string} type
 * @param {function} callback
 * @returns {string} A subscription token that can be passed to `unsubscribe`
 */
export function subscribe(type, callback) {
  return PubSub.subscribe(type, callback);
}

/**
 *
 * @param {string} token A subscription token provided by `subscribe`
 */
export function unsubscribe(token) {
  return PubSub.unsubscribe(token);
}

/**
 *
 * @param {string} type
 * @param {Object} data
 */
export function publish(type, data) {
  return PubSub.publish(type, data);
}
//# sourceMappingURL=pubSub.js.map