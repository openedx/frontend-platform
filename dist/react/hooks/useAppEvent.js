import { useEffect } from 'react';
import { subscribe, unsubscribe } from '../../pubSub';

/**
 * A React hook that allows functional components to subscribe to application events.  This should
 * be used sparingly - for the most part, Context should be used higher-up in the application to
 * provide necessary data to a given component, rather than utilizing a non-React-like Pub/Sub
 * mechanism.
 *
 * @memberof module:React
 *
 * @param {string} type
 * @param {function} callback
 */
var useAppEvent = function useAppEvent(type, callback) {
  useEffect(function () {
    var subscriptionToken = subscribe(type, callback);
    return function () {
      return unsubscribe(subscriptionToken);
    };
  }, [callback, type]);
};
export default useAppEvent;
//# sourceMappingURL=useAppEvent.js.map