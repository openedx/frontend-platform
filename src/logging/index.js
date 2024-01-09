/**
 * #### Import members from **`@edx/frontend-platform/logging`**
 *
 * Contains a shared interface for logging information. (The default implementation is in
 * NewRelicLoggingService.js.) When in development mode, all messages will instead be sent to the console.
 *
 * The `initialize` function performs much of the logging configuration for you.  If, however,
 * you're not using the `initialize` function, logging (via New Relic) can be configured via:
 *
 * ```
 * import { configure, NewRelicLoggingService, logInfo, logError } from '@edx/frontend-platform/logging';
 * import { geConfig } from '@edx/frontend-platform';
 *
 * configureLogging(NewRelicLoggingService, {
 *   config: getConfig(),
 * });
 *
 * logInfo('Just so you know...');
 * logInfo(new Error('Unimportant error'), { type: 'unimportant' });
 * logError('Uhoh!');
 * logError(new Error('Uhoh error!'));
 * ```
 *
 * As shown in this example, logging depends on the configuration document.
 * @module Logging
 */
export {
  getLoggingService,
  resetLoggingService,
  configure,
  logInfo,
  logError,
} from './interface.js';
export { default as NewRelicLoggingService } from './NewRelicLoggingService.js';
export { default as MockLoggingService } from './MockLoggingService.js';

/** @typedef {import('./interface.js').LoggingService} LoggingService */
