import 'core-js/stable';
import 'regenerator-runtime/runtime';

import { Routes, Route } from 'react-router-dom';
import React from 'react';
import ReactDOM from 'react-dom';
import { APP_INIT_ERROR, APP_READY, initialize } from '@edx/frontend-platform';
import { subscribe } from '@edx/frontend-platform/pubSub';

import {
  AppProvider,
  AuthenticatedPageRoute,
  ErrorPage,
  PageRoute,
} from '../src/react';

import './index.scss';
import ExamplePage from './ExamplePage';
import AuthenticatedPage from './AuthenticatedPage';

subscribe(APP_READY, () => {
  ReactDOM.render(
    <AppProvider>
      <Routes>
        <Route path="/" element={<ExamplePage />} />
        <Route
          path="/error_example"
          element={<ErrorPage message="Test error message" />}
        />
        <Route path="/authenticated" element={<AuthenticatedPageRoute><AuthenticatedPage /></AuthenticatedPageRoute>} />
      </Routes>
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
