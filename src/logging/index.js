export { configure, logInfo, logError } from './interface';
export { default as NewRelicLoggingService } from './NewRelicLoggingService';

const getLoggingService = () => ({
  logInfo,
  logError,
});

export { getLoggingService };
