import { configure, logInfo, logError } from './interface';

const getLoggingService = () => ({
  logInfo: (...args) => logInfo(...args),
  logError: (...args) => logError(...args),
});

export { getLoggingService, configure, logInfo, logError };
export { default as NewRelicLoggingService } from './NewRelicLoggingService';
