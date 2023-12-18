// @ts-check
import { processAxiosError } from '../utils.js';

const createProcessAxiosRequestErrorInterceptor = (options) => {
  const { loggingService } = options;

  // Creating the interceptor inside this closure to
  // maintain reference to the options supplied.
  const interceptor = async (error) => {
    const processedError = processAxiosError(error);
    const { httpErrorStatus } = processedError.customAttributes;
    if (httpErrorStatus === 401 || httpErrorStatus === 403) {
      loggingService.logInfo(processedError.message, processedError.customAttributes);
    }
    return Promise.reject(processedError);
  };

  return interceptor;
};

export default createProcessAxiosRequestErrorInterceptor;
