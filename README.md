# frontend-logging

[![Build Status](https://api.travis-ci.org/edx/frontend-logging.svg?branch=master)](https://travis-ci.org/edx/frontend-logging) [![Coveralls](https://img.shields.io/coveralls/edx/frontend-logging.svg?branch=master)](https://coveralls.io/github/edx/frontend-logging)
[![npm_version](https://img.shields.io/npm/v/@edx/frontend-logging.svg)](@edx/frontend-logging)
[![npm_downloads](https://img.shields.io/npm/dt/@edx/frontend-logging.svg)](@edx/frontend-logging)
[![license](https://img.shields.io/npm/l/@edx/frontend-logging.svg)](@edx/frontend-logging)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)


frontend-logging contains a shared interface for logging errors and event to New Relic.

## Usage

To install frontend-logging into your project:

```
npm i --save @edx/frontend-logging
```

```
import LoggingService from '@edx/frontend-logging';

LoggingService.logAPIErrorResponse(e);
```
