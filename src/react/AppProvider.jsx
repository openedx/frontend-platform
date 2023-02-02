import React, { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Router } from 'react-router-dom';

import OptionalReduxProvider from './OptionalReduxProvider';

import ErrorBoundary from './ErrorBoundary';
import AppContext from './AppContext';
import { useAppEvent } from './hooks';
import { getAuthenticatedUser, AUTHENTICATED_USER_CHANGED } from '../auth';
import { getConfig } from '../config';
import { CONFIG_CHANGED } from '../constants';
import { history } from '../initialize';
import {
  getLocale,
  getMessages,
  IntlProvider,
  LOCALE_CHANGED,
} from '../i18n';

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
 * @param {Object} [props.store] A redux store.
 * @memberof module:React
 */
export default function AppProvider({ store, children }) {
  const [config, setConfig] = useState(getConfig());
  const [authenticatedUser, setAuthenticatedUser] = useState(getAuthenticatedUser());
  const [locale, setLocale] = useState(getLocale());
  const [themeLoaded, setThemeLoaded] = useState(false);

  useAppEvent(AUTHENTICATED_USER_CHANGED, () => {
    setAuthenticatedUser(getAuthenticatedUser());
  });

  useAppEvent(CONFIG_CHANGED, () => {
    setConfig(getConfig());
  });

  useAppEvent(LOCALE_CHANGED, () => {
    setLocale(getLocale());
  });

  useEffect(() => {
    if (config.THEME_OVERRIDE_URL) {
      const themeLink = document.createElement('link');
      themeLink.href = config.THEME_OVERRIDE_URL;
      themeLink.rel = 'stylesheet';
      themeLink.type = 'text/css';
      themeLink.onload = () => setThemeLoaded(true);
      themeLink.onerror = () => setThemeLoaded(true);

      document.head.appendChild(themeLink);

      return () => document.head.removeChild(themeLink);
    }
    setThemeLoaded(true);
  }, [config.THEME_OVERRIDE_URL]);

  const appContextValue = useMemo(() => ({ authenticatedUser, config, locale }), [authenticatedUser, config, locale]);

  if (!themeLoaded) {
    return null;
  }

  return (
    <IntlProvider locale={locale} messages={getMessages()}>
      <ErrorBoundary>
        <AppContext.Provider
          value={appContextValue}
        >
          <OptionalReduxProvider store={store}>
            <Router history={history}>
              {children}
            </Router>
          </OptionalReduxProvider>
        </AppContext.Provider>
      </ErrorBoundary>
    </IntlProvider>
  );
}

AppProvider.propTypes = {
  store: PropTypes.shape({}),
  children: PropTypes.node.isRequired,
};

AppProvider.defaultProps = {
  store: null,
};
