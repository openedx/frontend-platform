/* eslint-disable import/prefer-default-export */
import { useEffect } from 'react';
import { subscribe, unsubscribe } from '../pubSub';

/**
 *
 *
 * @param {*} type
 * @param {*} callback
 */
export const useAppEvent = (type, callback) => {
  useEffect(() => {
    const subscriptionToken = subscribe(type, callback);

    return function cleanup() {
      unsubscribe(subscriptionToken);
    };
  }, []);
};
