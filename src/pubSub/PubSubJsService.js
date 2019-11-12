
import PubSub from 'pubsub-js';

export default class PubSubJsService {
  subscribe(type, callback) {
    return PubSub.subscribe(type, callback);
  }

  unsubscribe(token) {
    PubSub.unsubscribe(token);
  }
}
