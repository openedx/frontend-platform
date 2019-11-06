import 'babel-polyfill'; // eslint-disable-line import/no-extraneous-dependencies

import React from 'react';
import ReactDOM from 'react-dom';
import { Route } from 'react-router-dom';
import { App, AppProvider, APP_ERROR, APP_READY, ErrorPage, AuthenticatedRoute } from '../src';
import './index.scss';
import ExamplePage from './ExamplePage';
import AuthenticatedPage from './AuthenticatedPage';

App.subscribe(APP_READY, () => {
  ReactDOM.render(
    <AppProvider>
      <Route exact path="/" component={ExamplePage} />
      <AuthenticatedRoute exact path="/authenticated" component={AuthenticatedPage} />
    </AppProvider>,
    document.getElementById('root'),
  );
});

App.subscribe(APP_ERROR, (error) => {
  ReactDOM.render(<ErrorPage message={error.message} />, document.getElementById('root'));
});

App.initialize({
  messages: [],
  requireAuthenticatedUser: false,
  hydrateAuthenticatedUser: true,
});
