# frontend-base

[![Build Status](https://api.travis-ci.org/edx/frontend-base.svg?branch=master)](https://travis-ci.org/edx/frontend-base)
[![Codecov](https://img.shields.io/codecov/c/github/edx/frontend-base)](https://codecov.io/gh/edx/frontend-base)
[![NPM Version](https://img.shields.io/npm/v/@edx/frontend-base.svg)](https://www.npmjs.com/package/@edx/frontend-base)
[![npm_downloads](https://img.shields.io/npm/dt/@edx/frontend-base.svg)](https://www.npmjs.com/package/@edx/frontend-base)
[![license](https://img.shields.io/npm/l/@edx/frontend-base.svg)](https://github.com/edx/frontend-base/blob/master/LICENSE)
[![semantic release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

## Overview

Foundational application management code for Open edX micro-frontend applications.

`frontend-base` provides Open edX micro-frontends with:

- A standardized, yet customizable application initialization process.
- Lifecycle event subscriptions for startup sequence extension.
- Convenient access to environment configuration and application state data.
- A React-based application data provider.
- High-level logging of events and errors to promote observability.
- Fallback error handling.

With respect to the initialization process, `frontend-base` helps manage the vast majority of what we expect all Open edX micro-frontends to have by default, namely:

- Environment configuration
- Authentication / access to an authenticated API client
- Analytics
- Logging
- Internationalization

## Running the example app and test suite

This repo has an example app that demonstrates basic usage of the library.

```
npm install # do this once
npm start # starts the dev server
```

Visit http://localhost:1234/ in your browser.

The jest test suite can be run with:

```
npm test
```

## Getting Started

Initialization is managed via the `App` singleton.

The simplest initialization sequence looks like this:

```
import { App, APP_READY } from '@edx/frontend-base';

import HelloWorld from './HelloWorld'; // Your application component

App.subscribe(APP_READY, () => {
  ReactDOM.render(
    <HelloWorld />
  )
});

App.initialize();
```

This initialization sequence will do the following:

- Read in expected environment configuration variables and validate that they're not `undefined`
- Configure NewRelicLoggingService for @edx/frontend-logging.
- Verify that the user is logged in and authenticated, with a current JWT token.
- Redirect the user to login if they're not authenticated.
- Initialize i18n without any messages.
- Configure analytics with Segment.

### Error handling

If an error occurs during the initialization sequence, the application will go into an error state and log the error to the logging service.

You can hook into this state by subscribing to the `APP_ERROR` event.  For convenience, `frontend-base` provides a simple `<ErrorPage>` component that can be used to display errors to the user of the app as a fallback error experience.  This experience can be used as-is (shown below), or replaced with your own error page experience.

```
App.subscribe(APP_ERROR, (error) => {
  ReactDOM.render(<ErrorPage />, document.getElementById('root'));
});
```

### Error handling after initialization (in React)

It's recommended that in React applications you use [error boundaries](https://reactjs.org/docs/error-boundaries.html) to catch run-time errors in your React components.

`frontend-base` provides an error boundary component which displays `<ErrorPage>` in the event of an uncaught error in React. If you use `<AppProvider>` then you'll get this behavior for free.

If you need a custom error page, you can add your own error boundary inside `<AppProvider>` and the fallback handling will effectively be ignored (since errors won't bubble up to it anymore).

### Foundational React Components

`frontend-base` also provides several companion React components which pair with the App singleton to help bootstrap your React application.  Please see the API documentation for `<AppProvider>` and `<AppContext>` specifically; they're an important part of the frontend-base ecosystem.

## Additional Resources

- [API Reference](https://github.com/edx/frontend-base/blob/master/docs/API.md)