import React from 'react';

/**
 * @typedef {Object} AppContext
 * @property {import('../auth/interface').UserData|null} authenticatedUser
 * @property {import('../config').ConfigDocument} config
 * @property {string} locale
 */

/**
 * `AppContext` provides data from `App` in a way that React components can readily consume, even
 * if it's mutable data. `AppContext` contains the following data structure:
 *
 * ```
 * {
 *   authenticatedUser: <THE App.authenticatedUser OBJECT>,
 *   config: <THE App.config OBJECT>
 * }
 * ```
 * If the `App.authenticatedUser` or `App.config` data changes, `AppContext` will be updated
 * accordingly and pass those changes onto React components using the context.
 *
 * `AppContext` is used in a React application like any other `[React Context](https://reactjs.org/docs/context.html)
 * @memberof module:React
 */
const AppContext = React.createContext(/** @type {AppContext} */ ({
  authenticatedUser: null,
  config: {},
  locale: ""
}));

export default AppContext;
