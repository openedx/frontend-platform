/* eslint-disable import/prefer-default-export */
import { useEffect } from 'react';
import { subscribe, unsubscribe } from '../pubSub';
import { sendTrackEvent } from '../analytics';

/**
 * A React hook that allows functional components to subscribe to application events.  This should
 * be used sparingly - for the most part, Context should be used higher-up in the application to
 * provide necessary data to a given component, rather than utilizing a non-React-like Pub/Sub
 * mechanism.
 *
 * @memberof module:React
 * @param {string} type
 * @param {function} callback
 */
export const useAppEvent = (type, callback) => {
  useEffect(() => {
    const subscriptionToken = subscribe(type, callback);

    return function cleanup() {
      unsubscribe(subscriptionToken);
    };
  }, [callback, type]);
};

/**
 * A React hook that allows components to receive data about the current color scheme
 * of the user's device (light, dark) and update if it has changed.
 *
 * @memberof module:React
 * @param {string} eventName
 */
export const useTrackColorSchemeChoice = (eventName) => {
  useEffect(() => {
    const trackColorSchemeChoice = (({ matches }) => {
      let preferredColorScheme = 'dark';

      if (matches) {
        preferredColorScheme = 'light';
      }

      sendTrackEvent(`openedx.ui.${eventName}.prefers-color-scheme.selected`, {
        preferredColorScheme,
      });
    });

    const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // send user's initial choice
    trackColorSchemeChoice(colorSchemeQuery);

    colorSchemeQuery.addEventListener('change', trackColorSchemeChoice);
    return () => colorSchemeQuery.removeEventListener('change', trackColorSchemeChoice);
  }, [eventName]);
};
