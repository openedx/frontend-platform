import 'babel-polyfill';

import { NewRelicLoggingService } from '@edx/frontend-logging';
import React from 'react';
import ReactDOM from 'react-dom';

import { App, AppProvider, APP_ERROR, APP_READY, ErrorPage } from '../src';
import './index.scss';
import ExamplePage from './ExamplePage';

App.subscribe(APP_READY, () => {
  ReactDOM.render(
    <AppProvider>
      <ExamplePage />
    </AppProvider>,
    document.getElementById('root'),
  );
});

App.subscribe(APP_ERROR, (error) => {
  ReactDOM.render(<ErrorPage message={error.message} />, document.getElementById('root'));
});

App.initialize({ messages: [], loggingService: NewRelicLoggingService });
