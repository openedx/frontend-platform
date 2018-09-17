function logInfo(message) {
  if (typeof newrelic !== 'undefined') {
    newrelic.addPageAction('INFO', { message }); // eslint-disable-line no-undef
  }
}

function logError(error) {
  if (typeof newrelic !== 'undefined') {
    newrelic.noticeError(error); // eslint-disable-line no-undef
  }
}

// Log error responses returned from backend API calls.
function logAPIErrorResponse(error) {
  let { message } = error;
  if (error.response) {
    message = `${error.response.status} ${error.request.url} ${error.response.data}`;
  } else if (error.request) {
    message = error.request;
  }
  logError(new Error(`API request failed: ${message}`));
}

export {
  logAPIErrorResponse,
  logInfo,
  logError,
};
