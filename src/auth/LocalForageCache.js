/* eslint-disable no-underscore-dangle */
import localforage from 'localforage';
import memoryDriver from 'localforage-memoryStorageDriver';
import {
  setupCache,
  defaultKeyGenerator,
  defaultHeaderInterpreter,
  buildStorage,
} from 'axios-cache-interceptor';
import axios from 'axios';

/**
 * Async function to configure localforage and setup the cache
 *
 * @returns {Promise} A promise that, when resolved, returns an axios instance configured to
 * use localforage as a cache.
 */
export default async function configureCache() {
  // Register the imported `memoryDriver` to `localforage`
  await localforage.defineDriver(memoryDriver);

  // Create `localforage` instance
  const forageStore = localforage.createInstance({
    // List of drivers used
    driver: [
      localforage.INDEXEDDB,
      localforage.LOCALSTORAGE,
      memoryDriver._driver,
    ],
    name: 'edx-cache',
  });

  const forageStoreAdapter = buildStorage({
    async find(key) {
      const result = await forageStore.getItem(`axios-cache:${key}`);
      return JSON.parse(result);
    },

    async set(key, value) {
      await forageStore.setItem(`axios-cache:${key}`, JSON.stringify(value));
    },

    async remove(key) {
      await forageStore.removeItem(`axios-cache:${key}`);
    },
  });

  // only GET methods are cached by default
  return setupCache(
    // axios instance
    axios.create(),
    {
      ttl: 5 * 60 * 1000, // default maxAge of 5 minutes
      // The storage to save the cache data. There are more available by default.
      //
      // https://axios-cache-interceptor.js.org/#/pages/storages
      storage: forageStoreAdapter,

      // The mechanism to generate a unique key for each request.
      //
      // https://axios-cache-interceptor.js.org/#/pages/request-id
      generateKey: defaultKeyGenerator,

      // The mechanism to interpret headers (when cache.interpretHeader is true).
      //
      // https://axios-cache-interceptor.js.org/#/pages/global-configuration?id=headerinterpreter
      headerInterpreter: defaultHeaderInterpreter,

      // The function that will receive debug information.
      // NOTE: For this to work, you need to enable development mode.
      //
      // https://axios-cache-interceptor.js.org/#/pages/development-mode
      // https://axios-cache-interceptor.js.org/#/pages/global-configuration?id=debug
      // eslint-disable-next-line no-console
      debug: console.log,
    },
  );
}
