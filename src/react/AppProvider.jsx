import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter as Router } from 'react-router-dom';

import OptionalReduxProvider from './OptionalReduxProvider';

import ErrorBoundary from './ErrorBoundary';
import AppContext from './AppContext';
import { useAppEvent, useTrackColorSchemeChoice } from './hooks';
import { getAuthenticatedUser, AUTHENTICATED_USER_CHANGED } from '../auth';
import { getConfig } from '../config';
import { CONFIG_CHANGED } from '../constants';
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
export default function AppProvider({ store, children, wrapWithRouter }) {
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
              <Router>
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
  // eslint-disable-next-line react/forbid-prop-types
  store: PropTypes.object,
  children: PropTypes.node.isRequired,
  wrapWithRouter: PropTypes.bool,
};

AppProvider.defaultProps = {
  store: null,
  wrapWithRouter: true,
};
