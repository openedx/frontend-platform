[![Build Status](https://api.travis-ci.org/edx/frontend-platform.svg?branch=master)](https://travis-ci.org/edx/frontend-platform)
[![Codecov](https://img.shields.io/codecov/c/github/edx/frontend-platform)](https://codecov.io/gh/edx/frontend-platform)
[![NPM Version](https://img.shields.io/npm/v/@edx/frontend-platform.svg)](https://www.npmjs.com/package/@edx/frontend-platform)
[![npm_downloads](https://img.shields.io/npm/dt/@edx/frontend-platform.svg)](https://www.npmjs.com/package/@edx/frontend-platform)
[![license](https://img.shields.io/npm/l/@edx/frontend-platform.svg)](https://github.com/edx/frontend-platform/blob/master/LICENSE)
[![semantic release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

# Overview

frontend-platform is a modest application framework for Open edX micro-frontend applications and their supporting libraries. It provides a number of foundational services that all Open edX micro-frontends should have:

- Analytics
- Logging
- Authenticated API client (auth)
- Internationalization (i18n)

In addition, frontend-platform provides an extensible application initialization lifecycle to help manage the configuration of the above services, freeing application developers to focus on feature development.

## Architecture

The four foundational services listed above (analytics, auth, i18n, and logging) are provided as imports to applications via frontend-platform's API layer.  The initialization sequence creates an instance of each service and exposes its methods as functional exports, creating a layer of abstraction between service implementations and their usage in application code.

Each type of service has a documented API contract which service implementations must fulfill. This allows different service implementations to be used as necessary without updates to consuming applications.

### Service architecture

Internally, service implementations are strictly isolated from the rest of the platform.  They are classes that take their dependencies as arguments to their constructor.  This means, for instance, if analytics depends on logging, it takes a reference to an instance fulfilling the `LoggingService` interface as an option when it's instantiated.  It cannot import from the logging module directly.  Put another way, the default service implementations may be co-located with the service interfaces for convenience, but they can theoretically live in their own repository and it wouldn't require any refactoring.

Likewise, platform code should not make use of service methods that are not part of the documented interface for the same reasons.

### Application Initialization

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

### Service interfaces

Each service (analytics, auth, i18n, logging) provided by frontend-platform has a API contract which all implementations of that service are guaranteed to fulfill.  Applications that use frontend-platform can use its configured services via a convenient set of exported functions.  An application that wants to use the service interfaces need only initialize them via the initialize() function, optionally providing custom service interfaces as desired (you probably won't need to).

![Service interface](service-interface.png)

### Service implementations

This repository contains default service implementations for convenience.  These implementations are co-located with their consuming service interfaces for ease of development, though the two should remain _strictly_ modular and separate.

The included service implementations are:

- New Relic (logging)
- Segment (analytics)
- Axios/JWT (auth)
- React Intl (i18n)

NOTE: As of this writing, both authentication and i18n are _not_ configurable.  The `initialize()` function does not allow applications to supply alternate auth/i18n implementations; this is because the interface and implementations for auth and i18n have not yet been separated and modularized.
