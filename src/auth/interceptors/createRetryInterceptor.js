import axios from 'axios';

const createRetryInterceptor = (options = {}) => {
  const {
    httpClient = axios.create(),
    // This default algorithm is a recreation of what is documented here
    // https://cloud.google.com/storage/docs/exponential-backoff
    getBackoffMs = (nthRetry, maximumBackoff = 32000) => {
      const randomSecond = Math.random();
      const exponentialBackoff = ((2 ** nthRetry) + randomSecond) * 1000;
      return Math.min(Math.round(exponentialBackoff), maximumBackoff);
    },
    // By default only retry outbound request failures (not responses)
    shouldRetry = error => !error.response && error.config,
    // By default only retry 4 times, a per-request maxRetries can be
    // specified in request config.
    defaultMaxRetries = 2,
  } = options;

  const interceptor = async (error) => {
    const { config } = error;

    // If no config exists there was some other error setting up the request
    if (!config) {
      return Promise.reject(error);
    }

    if (!shouldRetry(error)) {
      return Promise.reject(error);
    }

    const {
      maxRetries = defaultMaxRetries,
    } = config;

    const retryRequest = async (nthRetry) => {
      if (nthRetry > maxRetries) {
        // Reject with the original error
        return Promise.reject(error);
      }

      let retryResponse;

      try {
        const backoffDelay = getBackoffMs(nthRetry);
        // Delay (wrapped in a promise so we can await the setTimeout)
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        // Make retry request
        retryResponse = await httpClient.request(config);
      } catch (e) {
        return retryRequest(nthRetry + 1);
      }

      return retryResponse;
    };

    return retryRequest(1);
  };

  return interceptor;
};

export default createRetryInterceptor;
