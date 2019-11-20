import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Router } from 'react-router-dom';

import OptionalReduxProvider from './OptionalReduxProvider';

import ErrorBoundary from './ErrorBoundary';
import AppContext from './AppContext';
import { useAppEvent } from './hooks';
import { identifyAnonymousUser, identifyAuthenticatedUser } from '../../analytics';
import { getAuthenticatedUser, AUTHENTICATED_USER_CHANGED } from '../../auth';
import { getConfig, CONFIG_CHANGED } from '../../config';
import { history } from '../../init';
import { getLocale, getMessages, IntlProvider } from '../../i18n';

const AppProvider = ({ store, children }) => {
  const [config, setConfig] = useState(getConfig());
  const [authenticatedUser, setAuthenticatedUser] = useState(getAuthenticatedUser());

  useAppEvent(AUTHENTICATED_USER_CHANGED, () => {
    setAuthenticatedUser(getAuthenticatedUser());
  });

  useAppEvent(CONFIG_CHANGED, () => {
    setConfig(getConfig());
  });

  // Identify the user
  useEffect(() => {
    if (authenticatedUser === null) {
      identifyAnonymousUser();
    } else {
      identifyAuthenticatedUser(authenticatedUser.userId);
    }
  }, [authenticatedUser && authenticatedUser.username]);

  return (
    <ErrorBoundary>
      <AppContext.Provider
        value={{ authenticatedUser, config }}
      >
        <IntlProvider locale={getLocale()} messages={getMessages()}>
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
