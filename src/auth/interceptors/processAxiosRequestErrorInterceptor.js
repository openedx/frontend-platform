import { processAxiosError } from '../utils';

const createProcessAxiosRequestErrorInterceptor = (options) => {
  const {
    logInfo,
  } = options;

  const interceptor = (error) => {
    const processedError = processAxiosError(error);
    const { httpErrorStatus } = processedError.customAttributes;
    if (httpErrorStatus === 401 || httpErrorStatus === 403) {
      logInfo(processedError, processedError.customAttributes);
    }
    return Promise.reject(processedError);
  };

  return interceptor;
};

export default createProcessAxiosRequestErrorInterceptor;
