import { getLoggingService } from '../AxiosJwtAuthService';
import { processAxiosError } from '../utils';

const processAxiosRequestErrorInterceptor = (error) => {
  const processedError = processAxiosError(error);
  const { httpErrorStatus } = processedError.customAttributes;
  if (httpErrorStatus === 401 || httpErrorStatus === 403) {
    getLoggingService().logInfo(processedError, processedError.customAttributes);
  }
  return Promise.reject(processedError);
};

export default processAxiosRequestErrorInterceptor;
