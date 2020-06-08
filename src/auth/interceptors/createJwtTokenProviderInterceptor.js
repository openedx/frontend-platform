const createJwtTokenProviderInterceptor = (options) => {
  const {
    jwtTokenService,
    shouldSkip,
  } = options;

  // Creating the interceptor inside this closure to
  // maintain reference to the options supplied.
  const interceptor = async (axiosRequestConfig) => {
    if (shouldSkip(axiosRequestConfig)) {
      return axiosRequestConfig;
    }

    // Important: the job of this interceptor is to refresh a jwt token and update
    // the original request configuration. Errors thrown from fetching the jwt
    // should contain the original request config. This allows other interceptors
    // (namely our retry request interceptor below) to access the original request
    // and handle it appropriately
    try {
      await jwtTokenService.getJwtToken();
    } catch (error) {
      const requestError = Object.create(error);
      requestError.message = `[getJwtToken] ${requestError.message}`;
      // Important: return the original axios request config
      requestError.config = axiosRequestConfig;
      return Promise.reject(requestError);
    }

    // Add the proper headers to tell the server to look for the jwt cookie
    // eslint-disable-next-line no-param-reassign
    axiosRequestConfig.headers.common['USE-JWT-COOKIE'] = true;
    return axiosRequestConfig;
  };

  return interceptor;
};

export default createJwtTokenProviderInterceptor;
