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
import { IntlProvider } from '@edx/frontend-platform/i18n';

import './index.scss';
import ExamplePage from './ExamplePage';
import AuthenticatedPage from './AuthenticatedPage';

subscribe(APP_READY, () => {
  ReactDOM.render(
    <AppProvider>
      <PageRoute exact path="/" component={ExamplePage} />
      <PageRoute
        exact
        path="/error_example"
        component={() => <ErrorPage message="Test error message" />}
      />
      <AuthenticatedPageRoute exact path="/authenticated" component={AuthenticatedPage} />
    </AppProvider>,
    document.getElementById('root'),
  );
});

subscribe(APP_INIT_ERROR, (error) => {
  ReactDOM.render(<IntlProvider><ErrorPage message={error.message} /></IntlProvider>, document.getElementById('root'));
});

initialize({
  messages: [],
  requireAuthenticatedUser: false,
  hydrateAuthenticatedUser: true,
});
