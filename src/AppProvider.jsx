import React from 'react';
import PropTypes from 'prop-types';
import { getLocale, getMessages, IntlProvider } from '@edx/frontend-i18n';
import { Router } from 'react-router-dom';

import OptionalReduxProvider from './OptionalReduxProvider';

import App from './App';
import ErrorBoundary from './ErrorBoundary';
import AppContext from './AppContext';

const AppProvider = ({ store, children }) => (
  <ErrorBoundary>
    <AppContext.Provider value={{ authenticatedUser: App.authenticatedUser, config: App.config }}>
      <IntlProvider locale={getLocale()} messages={getMessages()}>
        <OptionalReduxProvider store={store}>
          <Router history={App.history}>
            <React.Fragment>
              {children}
            </React.Fragment>
          </Router>
        </OptionalReduxProvider>
      </IntlProvider>
    </AppContext.Provider>
  </ErrorBoundary>
);

AppProvider.propTypes = {
  store: PropTypes.object, // eslint-disable-line
  children: PropTypes.node.isRequired,
};

AppProvider.defaultProps = {
  store: null,
};

export default AppProvider;
