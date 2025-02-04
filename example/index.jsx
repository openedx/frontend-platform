import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
/* eslint-disable import/no-extraneous-dependencies */
import {
  AppProvider,
  AuthenticatedPageRoute,
  ErrorPage,
  PageWrap,
} from '@edx/frontend-platform/react';
import { APP_INIT_ERROR, APP_READY, initialize } from '@edx/frontend-platform';
import { subscribe } from '@edx/frontend-platform/pubSub';
/* eslint-enable import/no-extraneous-dependencies */
import { Routes, Route } from 'react-router-dom';

import './index.scss';
import ExamplePage from './ExamplePage';
import AuthenticatedPage from './AuthenticatedPage';

const container = document.getElementById('root');
const root = createRoot(container);

subscribe(APP_READY, () => {
  root.render(
    <StrictMode>
      <AppProvider>
        <Routes>
          <Route path="/" element={<PageWrap><ExamplePage /></PageWrap>} />
          <Route
            path="/error_example"
            element={<PageWrap><ErrorPage message="Test error message" /></PageWrap>}
          />
          <Route path="/authenticated" element={<AuthenticatedPageRoute><AuthenticatedPage /></AuthenticatedPageRoute>} />
        </Routes>
      </AppProvider>
    </StrictMode>,
  );
});

subscribe(APP_INIT_ERROR, (error) => {
  root.render(<ErrorPage message={error.message} />);
});

initialize({
  messages: [],
  requireAuthenticatedUser: false,
  hydrateAuthenticatedUser: true,
});
