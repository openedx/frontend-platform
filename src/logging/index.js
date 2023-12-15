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
