import 'core-js/stable';
import 'regenerator-runtime/runtime';

import React from 'react';
import ReactDOM from 'react-dom';
import { Switch } from 'react-router-dom';

import { AppProvider, ErrorPage, PageRoute } from '@edx/frontend-platform/react';
import {
  APP_INIT_ERROR, APP_READY, subscribe, initialize,
} from '@edx/frontend-platform';

import PluginOne from './PluginOne';
import PluginTwo from './PluginTwo';

import './index.scss';

subscribe(APP_READY, () => {
  ReactDOM.render(
    <AppProvider>
      <Switch>
        <PageRoute path="/plugin1">
          <PluginOne />
        </PageRoute>
        <PageRoute path="/plugin2">
          <PluginTwo />
        </PageRoute>
      </Switch>
    </AppProvider>,
    document.getElementById('root'),
  );
});

subscribe(APP_INIT_ERROR, (error) => {
  ReactDOM.render(<ErrorPage message={error.message} />, document.getElementById('root'));
});

initialize({
  messages: [],
  handlers: {
    auth: () => {},
  },
  requireAuthenticatedUser: false,
});
