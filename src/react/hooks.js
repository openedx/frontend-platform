/* eslint-disable import/prefer-default-export */
import { useEffect } from 'react';
import { subscribe, unsubscribe } from '../pubSub';

/**
 *
 * @memberof React
 * @param {string} type
 * @param {function} callback
 */
export const useAppEvent = (type, callback) => {
  useEffect(() => {
    const subscriptionToken = subscribe(type, callback);

    return function cleanup() {
      unsubscribe(subscriptionToken);
    };
  }, []);
};
