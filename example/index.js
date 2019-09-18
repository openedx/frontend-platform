import 'babel-polyfill';

import { NewRelicLoggingService } from '@edx/frontend-logging';
import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux';

/* TODO: When Parcel 2.0 comes out, use the source code instead of the dist here again.
 * Parcel 1.x has a limitation where it can't use babel.config.js, meaning that we can't use our
 * uncompiled source in this dev server.
 * https://github.com/parcel-bundler/parcel/issues/2110
 * */
import { App, AppProvider, APP_ERROR, APP_READY, ErrorPage } from '../dist/';
import './index.scss';
import ExamplePage from './ExamplePage';

console.warn("TODO: When Parcel 2.0 comes out, use the source code instead of the dist in the test server. Parcel 1.x has a limitation where it can't use babel.config.js, meaning that we can't use our uncompiled source in this dev server. https://github.com/parcel-bundler/parcel/issues/2110");

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
