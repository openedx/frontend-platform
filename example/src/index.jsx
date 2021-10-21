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
import {
  APP_INIT_ERROR, APP_READY, initialize, APP_CONFIG_INITIALIZED,
} from '@edx/frontend-platform';
import { subscribe } from '@edx/frontend-platform/pubSub';
import { mergeConfig } from '@edx/frontend-platform/config';
import { IFRAME_PLUGIN } from '@edx/frontend-platform/plugins';
import { Switch } from 'react-router-dom';

import ExamplePage from './ExamplePage';
import AuthenticatedPage from './AuthenticatedPage';
import PluginsPage from './PluginsPage';

import './index.scss';

subscribe(APP_READY, () => {
  ReactDOM.render(
    <AppProvider>
      <Switch>
        <PageRoute exact path="/" component={ExamplePage} />
        <PageRoute
          exact
          path="/error_example"
          component={() => <ErrorPage message="Test error message" />}
        />
        <PageRoute exact path="/plugins" component={PluginsPage} />
        <AuthenticatedPageRoute exact path="/authenticated" component={AuthenticatedPage} />
      </Switch>
    </AppProvider>,
    document.getElementById('root'),
  );
});

subscribe(APP_CONFIG_INITIALIZED, () => {
  mergeConfig({
    plugins: {
      example: {
        keepDefault: true,
        plugins: [
          {
            url: 'http://edx-test-plugin.com:8081/plugin1',
            type: IFRAME_PLUGIN,
          },
          {
            url: 'http://edx-test-plugin.com:8081/plugin2',
            type: IFRAME_PLUGIN,
          },
        ],
      },
    },
  }, 'App config initialized override handler');
});

subscribe(APP_INIT_ERROR, (error) => {
  ReactDOM.render(<ErrorPage message={error.message} />, document.getElementById('root'));
});

initialize({
  messages: [],
  requireAuthenticatedUser: false,
  hydrateAuthenticatedUser: true,
});
