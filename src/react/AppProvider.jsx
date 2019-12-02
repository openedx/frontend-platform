import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Router } from 'react-router-dom';

import OptionalReduxProvider from './OptionalReduxProvider';

import ErrorBoundary from './ErrorBoundary';
import AppContext from './AppContext';
import { useAppEvent } from './hooks';
import { getAuthenticatedUser, AUTHENTICATED_USER_CHANGED } from '../auth';
import { getConfig, CONFIG_CHANGED } from '../config';
import { history } from '../initialize';
import { getLocale, getMessages, IntlProvider, LOCALE_CHANGED } from '../i18n';

const AppProvider = ({ store, children }) => {
  const [config, setConfig] = useState(getConfig());
  const [authenticatedUser, setAuthenticatedUser] = useState(getAuthenticatedUser());
  const [locale, setLocale] = useState(getLocale());

  useAppEvent(AUTHENTICATED_USER_CHANGED, () => {
    setAuthenticatedUser(getAuthenticatedUser());
  });

  useAppEvent(CONFIG_CHANGED, () => {
    setConfig(getConfig());
  });

  useAppEvent(LOCALE_CHANGED, () => {
    setLocale(getLocale());
  });

  return (
    <ErrorBoundary>
      <AppContext.Provider
        value={{ authenticatedUser, config, locale }}
      >
        <IntlProvider locale={locale} messages={getMessages()}>
          <OptionalReduxProvider store={store}>
            <Router history={history}>
              <React.Fragment>{children}</React.Fragment>
            </Router>
          </OptionalReduxProvider>
        </IntlProvider>
      </AppContext.Provider>
    </ErrorBoundary>
  );
};

AppProvider.propTypes = {
  store: PropTypes.object, // eslint-disable-line
  children: PropTypes.node.isRequired,
};

AppProvider.defaultProps = {
  store: null,
};

export default AppProvider;
