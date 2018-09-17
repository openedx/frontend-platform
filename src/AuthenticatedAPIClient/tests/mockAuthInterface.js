// Apply mock auth interface to the given Axios object for testing purposes.
export default function applyMockAuthInterface(
  authenticatedAPIClient,
  rejectRefreshAccessToken = false,
) {
  const mockRefreshAccessToken = jest.fn();
  mockRefreshAccessToken.mockReturnValue(new Promise((resolve, reject) => {
    if (rejectRefreshAccessToken) {
      reject({ message: 'Failed!' }); // eslint-disable-line prefer-promise-reject-errors
    } else {
      resolve();
    }
  }));

  /* eslint-disable no-param-reassign */
  authenticatedAPIClient.getAuthenticationState = jest.fn();
  authenticatedAPIClient.isAuthenticated = jest.fn();
  authenticatedAPIClient.isAccessTokenExpired = jest.fn();
  authenticatedAPIClient.login = jest.fn();
  authenticatedAPIClient.logout = jest.fn();
  authenticatedAPIClient.refreshAccessToken = mockRefreshAccessToken;
  authenticatedAPIClient.isAuthUrl = jest.fn();
  authenticatedAPIClient.getDecodedAccessToken = jest.fn();
  /* eslint-enable no-param-reassign */
}
