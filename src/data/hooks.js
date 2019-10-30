import { useEffect } from 'react';
import App from '../App';

// eslint-disable-next-line import/prefer-default-export
export const useAppEvent = (type, callback) => {
  useEffect(() => {
    const subscriptionToken = App.subscribe(type, callback);

    return function cleanup() {
      App.unsubscribe(subscriptionToken);
    };
  }, []);
};
