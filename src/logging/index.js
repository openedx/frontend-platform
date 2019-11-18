export { configure, logInfo, logError } from './interface';
export { default as NewRelicLoggingService } from './NewRelicLoggingService';

const getLoggingService = () => ({
  logInfo: (...args) => logInfo(...args),
  logError: (...args) => logError(...arguments),
});

export { getLoggingService };
