/* eslint-disable no-underscore-dangle */
import localforage from 'localforage';
import memoryDriver from 'localforage-memoryStorageDriver';
import { setup } from 'axios-cache-adapter';

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

  // Set up the cache with a default maxAge of 5 minutes and using localforage as the storage source
  return setup({
    cache: {
      maxAge: 5 * 60 * 1000,
      store: forageStore,
      exclude: { query: false },
    },
  });
}
