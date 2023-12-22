// @ts-check
import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter as Router } from 'react-router-dom';

import OptionalReduxProvider from './OptionalReduxProvider.jsx';

import ErrorBoundary from './ErrorBoundary.jsx';
import AppContext from './AppContext.jsx';
import { useAppEvent, useTrackColorSchemeChoice } from './hooks.js';
import { getAuthenticatedUser, AUTHENTICATED_USER_CHANGED } from '../auth/index.js';
import { getConfig } from '../config.js';
import { CONFIG_CHANGED } from '../constants.js';
import {
  getLocale,
  getMessages,
  IntlProvider,
  LOCALE_CHANGED,
} from '../i18n/index.js';
import { basename } from '../initialize.js';

/**
 * A wrapper component for React-based micro-frontends to initialize a number of common data/
 * context providers.
 *
 * ```
 * subscribe(APP_READY, () => {
 *   ReactDOM.render(
 *     <AppProvider>
 *       <HelloWorld />
 *     </AppProvider>
 *   )
 * });
 * ```
 *
 * This will provide the following to HelloWorld:
 * - An error boundary as described above.
 * - An `AppContext` provider for React context data.
 * - IntlProvider for @edx/frontend-i18n internationalization
 * - Optionally a redux `Provider`. Will only be included if a `store` property is passed to
 * `AppProvider`.
 * - A `Router` for react-router.
 *
 * @param {Object} props
 * @param {import('react').ReactNode} props.children The contents of your app, as React components
 * @param {import('redux').Store|null} [props.store] Optional redux store.
 * @param {boolean} [props.wrapWithRouter] Set this false if you want to supply your own router
 */
export default function AppProvider({ children, store = null, wrapWithRouter = true }) {
  const [config, setConfig] = useState(getConfig());
  const [authenticatedUser, setAuthenticatedUser] = useState(getAuthenticatedUser());
  const [locale, setLocale] = useState(getLocale());

  useTrackColorSchemeChoice();

  useAppEvent(AUTHENTICATED_USER_CHANGED, () => {
    setAuthenticatedUser(getAuthenticatedUser());
  });

  useAppEvent(CONFIG_CHANGED, () => {
    setConfig(getConfig());
  });

  useAppEvent(LOCALE_CHANGED, () => {
    setLocale(getLocale());
  });

  const appContextValue = useMemo(() => ({ authenticatedUser, config, locale }), [authenticatedUser, config, locale]);

  return (
    <IntlProvider locale={locale} messages={getMessages()}>
      <ErrorBoundary>
        <AppContext.Provider
          value={appContextValue}
        >
          <OptionalReduxProvider store={store}>
            {wrapWithRouter ? (
              <Router basename={basename}>
                {children}
              </Router>
            ) : children}
          </OptionalReduxProvider>
        </AppContext.Provider>
      </ErrorBoundary>
    </IntlProvider>
  );
}

AppProvider.propTypes = {
  // Note: default values are set above in the props destructuring.
  // eslint-disable-next-line react/forbid-prop-types, react/require-default-props
  store: PropTypes.object,
  children: PropTypes.node.isRequired,
  // eslint-disable-next-line react/require-default-props
  wrapWithRouter: PropTypes.bool,
};
