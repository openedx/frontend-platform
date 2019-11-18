const createJwtTokenInterceptor = (options) => {
  const {
    shouldSkip,
    getJwtToken,
  } = options;

  // Creating the interceptor inside this closure to
  // maintain reference to the options supplied.
  const interceptor = async (axiosRequestConfig) => {
    if (shouldSkip(axiosRequestConfig)) {
      return axiosRequestConfig;
    }
    await getJwtToken();
    // Add the proper headers to tell the server to look for the jwt cookie
    // eslint-disable-next-line no-param-reassign
    axiosRequestConfig.headers.common['USE-JWT-COOKIE'] = true;
    return axiosRequestConfig;
  };

  return interceptor;
};

export default createJwtTokenInterceptor;
