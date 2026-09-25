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
 * Subscribes to a PubSub event.
 *
 * @param type - The event type to subscribe to
 * @param callback - The callback function invoked when the event is published
 * @returns A subscription token that can be passed to {@link unsubscribe}
 */
export function subscribe(type: string, callback: (message: string, data: unknown) => void): string {
  return PubSub.subscribe(type, callback);
}

/**
 * Unsubscribes from a PubSub event.
 *
 * @param token - A subscription token provided by {@link subscribe}
 */
export function unsubscribe(token: string): void {
  PubSub.unsubscribe(token);
}

/**
 * Publishes a PubSub event.
 *
 * @param type - The event type to publish
 * @param data - The data to pass to subscribers
 * @returns Whether the event was published successfully
 */
export function publish(type: string, data?: unknown): boolean {
  return PubSub.publish(type, data);
}
