import React from 'react';
import PropTypes from 'prop-types';
import { getLocale, getMessages, IntlProvider } from '@edx/frontend-i18n';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';

import App from './App';
import ErrorBoundary from './ErrorBoundary';
import AuthenticationContext from './AuthenticationContext';

const AppProvider = ({ store, children }) => (
  <ErrorBoundary>
    <AuthenticationContext.Provider value={App.authentication}>
      <IntlProvider locale={getLocale()} messages={getMessages()}>
        <Provider store={store}>
          <Router history={App.history}>
            <React.Fragment>
              {children}
            </React.Fragment>
          </Router>
        </Provider>
      </IntlProvider>
    </AuthenticationContext.Provider>
  </ErrorBoundary>
);

AppProvider.propTypes = {
  authentication: PropTypes.object.isRequired, // eslint-disable-line
  store: PropTypes.object.isRequired, // eslint-disable-line
  children: PropTypes.node.isRequired,
};

export default AppProvider;
