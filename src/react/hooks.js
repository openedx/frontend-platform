import { useEffect } from 'react';
import { subscribe, unsubscribe } from '../../pubSub';

// eslint-disable-next-line import/prefer-default-export
export const useAppEvent = (type, callback) => {
  useEffect(() => {
    const subscriptionToken = subscribe(type, callback);

    return function cleanup() {
      unsubscribe(subscriptionToken);
    };
  }, []);
};
