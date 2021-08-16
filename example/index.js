import 'core-js/stable';
import 'regenerator-runtime/runtime';

import React from 'react';
import ReactDOM from 'react-dom';
import {
  AppProvider,
  AuthenticatedPageRoute,
  ErrorPage,
  PageRoute,
} from '@edx/frontend-platform/react';
import { APP_INIT_ERROR, APP_READY, initialize } from '@edx/frontend-platform';
import { subscribe } from '@edx/frontend-platform/pubSub';

import ExamplePage from './ExamplePage';
import AuthenticatedPage from './AuthenticatedPage';
import PluginsPage from './PluginsPage';

import './index.scss';

subscribe(APP_READY, () => {
  ReactDOM.render(
    <AppProvider>
      <PageRoute exact path="/" component={ExamplePage} />
      <PageRoute
        exact
        path="/error_example"
        component={() => <ErrorPage message="Test error message" />}
      />
      <PageRoute exact path="/plugins" component={PluginsPage} />
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
