function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

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

export default function configureCache() {
  return _configureCache.apply(this, arguments);
}

function _configureCache() {
  _configureCache = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    var forageStore;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return localforage.defineDriver(memoryDriver);

          case 2:
            // Create `localforage` instance
            forageStore = localforage.createInstance({
              // List of drivers used
              driver: [localforage.INDEXEDDB, localforage.LOCALSTORAGE, memoryDriver._driver],
              name: 'edx-cache'
            }); // Set up the cache with a default maxAge of 5 minutes and using localforage as the storage source

            return _context.abrupt("return", setup({
              cache: {
                maxAge: 5 * 60 * 1000,
                store: forageStore,
                exclude: {
                  query: false
                }
              }
            }));

          case 4:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _configureCache.apply(this, arguments);
}
//# sourceMappingURL=LocalForageCache.js.map