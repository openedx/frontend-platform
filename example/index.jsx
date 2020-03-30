import 'babel-polyfill'; // eslint-disable-line import/no-extraneous-dependencies

import React from 'react';
import ReactDOM from 'react-dom';
import { Route } from 'react-router-dom';
import { AppProvider, ErrorPage, AuthenticatedPageRoute } from '@edx/frontend-platform/react';
import { APP_INIT_ERROR, APP_READY, initialize } from '@edx/frontend-platform';
import { subscribe } from '@edx/frontend-platform/pubSub';

import './index.scss';
import ExamplePage from './ExamplePage';
import AuthenticatedPage from './AuthenticatedPage';

subscribe(APP_READY, () => {
  ReactDOM.render(
    <AppProvider>
      <Route exact path="/" component={ExamplePage} />
      <Route
        exact
        path="/error_example"
        component={() =>
          <ErrorPage message="Test error message" />
        }
      />
      <AuthenticatedPageRoute exact path="/authenticated" component={AuthenticatedPage} />
    </AppProvider>,
    document.getElementById('root'),
  );
});

subscribe(APP_INIT_ERROR, (error) => {
  ReactDOM.render(<ErrorPage message={error.message} />, document.getElementById('root'));
});

initialize({
  messages: [],
  requireAuthenticatedUser: false,
  hydrateAuthenticatedUser: true,
});
