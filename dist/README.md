[![Build Status](https://github.com/openedx/frontend-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/openedx/frontend-platform/actions/workflows/ci.yml)
[![Codecov](https://img.shields.io/codecov/c/github/edx/frontend-platform)](https://codecov.io/gh/edx/frontend-platform)
[![NPM Version](https://img.shields.io/npm/v/@edx/frontend-platform.svg)](https://www.npmjs.com/package/@edx/frontend-platform)
[![npm_downloads](https://img.shields.io/npm/dt/@edx/frontend-platform.svg)](https://www.npmjs.com/package/@edx/frontend-platform)
[![license](https://img.shields.io/npm/l/@edx/frontend-platform.svg)](https://github.com/openedx/frontend-platform/blob/master/LICENSE)
[![semantic release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

# Overview

See the [GitHub Pages site for the complete documentation](https://openedx.github.io/frontend-platform/).

frontend-platform is a modest application framework for Open edX micro-frontend applications and their supporting libraries. It provides several foundational services that all Open edX micro-frontends should have:

| Service                            | Module location                  |
|------------------------------------|----------------------------------|
| Analytics                          | @edx/frontend-platform/analytics |
| Logging                            | @edx/frontend-platform/logging   |
| Authenticated API client (auth)    | @edx/frontend-platform/auth      |
| Internationalization (i18n)        | @edx/frontend-platform/i18n      |
| Misc (init, config, pubSub, utils) | @edx/frontend-platform           |

-------------------------------------------------------------------------

In addition, frontend-platform provides an extensible application initialization lifecycle to help manage the configuration of the above services, freeing application developers to focus on feature development.

## Getting started

### One-time setup if you have not upgraded node/npm
IMPORTANT: There is now a new node/npm version being used by frontend-platform as of
https://github.com/openedx/frontend-platform/pull/259

#### Install nvm
This is highly recommended to be able to leverage different node/npm versions.
For a some time, different repositories may be using different versions of node/npm.

Alternatively, please install node16 and npm8 for use with this repository.

#### Switch to node/npm version for this repo
```nvm use```
if you don't have the right node/npm versions, nvm will instruct you to install those

#### Clean out old node modules and reinstall
This step is needed because node now uses a different package lock format, and it's important to reinstall
dependencies based on this new package file. Delete node_modules, and issue an `npm ci`


### Standard getting started steps

1. `npm install`
2. `npm start`
3. Open http://localhost:8080 to view the example app.

## Architecture

The four foundational services listed above (analytics, auth, i18n, and logging) are provided as imports to applications via frontend-platform's API layer.  The initialization sequence creates an instance of each service and exposes its methods as functional exports, creating a layer of abstraction between service implementations and their usage in application code.

Each type of service has a documented API contract which service implementations must fulfill. This allows different service implementations to be used as necessary without updates to consuming applications.

### Service architecture

Internally, service implementations are strictly isolated from the rest of the platform.  They are classes that take their dependencies as arguments to their constructor.  This means, for instance, if analytics depends on logging, it takes a reference to an instance fulfilling the `LoggingService` interface as an option when it's instantiated.  It cannot import from the logging module directly.  Put another way, the default service implementations may be co-located with the service interfaces for convenience, but they can theoretically live in their own repository and it wouldn't require any refactoring.

Likewise, platform code should not make use of service methods that are not part of the documented interface for the same reasons.

### Application initialization

frontend-platform provides an `initialize()` function which bootstraps and configures an application.  The `initialize()` function uses a set of [sensible defaults](https://en.wikipedia.org/wiki/Convention_over_configuration) unless otherwise specified, bootstrapping the application with services reflecting Open edX's best practices around analytics, authentication, internationalization, and logging.

The initialization process proceeds in a series of phases, giving the initializing application code opportunities to hook into the process and do custom setup as desired:

- Before initialization
- Pub/Sub initialized
- Environment config document loaded
- Logging service initialized
- Authentication service initialized
- Analytics service initialized
- Internationalization service initialized
- Application ready

Most applications won't need to do anything special at all.

### Application configuration

When the application loads, a list of known environment variables is loaded from `process.env` into an object which it exposes via `getConfig` - the point here is primarily to isolate our code from usages of `process.env` which may not always be the way we choose to configure our apps.  The application initialization lifecycle supports runtime configuration as well via the `config` handler, documented in the [initialize function](https://edx.github.io/frontend-platform/module-Initialization.html#~initialize).  If you want to get a variable into the config that it’s not expecting, you can use [`mergeConfig`](https://edx.github.io/frontend-platform/module-Config.html#~mergeConfig) during initialization to add it in from `process.env`.

Such an example might look like this:

```
initialize({
  // ... other initialization options
  handlers: {
    config: () => {
      mergeConfig({
        CUSTOM_VARIABLE: process.env.CUSTOM_VARIABLE || null,
      }, 'Custom app config');
    },
  },
});
```

When using runtime configuration via `mergeConfig` noted above, `getConfig` must be called within a component's render lifecycle for the added keys and values to be returned in the configuration object. If `getConfig` is called outside of a component's render lifecycle, the custom configuration key/value pairs will not initially be part of the object returned by `getConfig`. For example:

```jsx
import { getConfig } from '@edx/frontend-platform/config';

// The runtime configuration `CUSTOM_VARIABLE` added in the above code snippet will not appear here. This is
// because `getConfig` is called before `mergeConfig` is executed to add the custom runtime configuration.
console.log(getConfig().CUSTOM_VARIABLE); // returns undefined

const ExampleComponent = () => {
  // This returns the value as expected since it is called after `mergeConfig` has already been executed.
  console.log(getConfig().CUSTOM_VARIABLE)
};
```

### Service interfaces

Each service (analytics, auth, i18n, logging) provided by frontend-platform has an API contract which all implementations of that service are guaranteed to fulfill.  Applications that use frontend-platform can use its configured services via a convenient set of exported functions.  An application that wants to use the service interfaces need only initialize them via the initialize() function, optionally providing custom service interfaces as desired (you probably won't need to).

![Service interface](service-interface.png)

### Service implementations

This repository contains default service implementations for convenience.  These implementations are co-located with their consuming service interfaces for ease of development, though the two should remain _strictly_ modular and separate.

The included service implementations are:

- New Relic (logging)
- Segment (analytics)
- Axios/JWT (auth)
- React Intl (i18n)

NOTE: As of this writing, i18n is _not_ configurable.  The `initialize()` function does not allow applications to supply an alternate i18n implementation; this is because the interface and implementation for i18n has not yet been separated and modularized.

# Local Development & Testing Locally

When making changes to frontend-platform, be sure to manually run the included example app located in `./example`. The example app includes 2 routes to test for both unauthenticated and authenticated users. To start the example app, run `npm start` from the root directory.

If you want to test changes to frontend-platform against a micro-frontend locally, follow the directions here: https://github.com/openedx/frontend-build#local-module-configuration-for-webpack

# Production Deployment Strategy

For any MFE built on top of the frontend-platform, the deployment strategy will be something like the following:

1. Run the build script with environment variables on the command line to pass in any relevant config. Example:

   ```bash
   NODE_ENV=development BASE_URL=open.edx.org ETC=etc npm run build
   ```

   This will create a dist/ directory that contains the deployable artifacts.

2. Copy the contents of dist/ to a web server.

3. Configure the platform to point at your MFE. (details on this coming soon)
