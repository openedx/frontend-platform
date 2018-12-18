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

  const mockGetCsrfToken = jest.fn();
  mockGetCsrfToken.mockReturnValue(new Promise((resolve) => {
    resolve({ data: { csrfToken: 'test-csrf-token' } });
  }));

  const mockGetUserProfile = jest.fn();
  mockGetUserProfile.mockReturnValue(new Promise((resolve) => {
    resolve({
      username: 'test-user',
      profile_image: {
        image_url_medium: 'test-image-url',
      },
    });
  }));

  /* eslint-disable no-param-reassign */
  authenticatedAPIClient.getAuthenticationState = jest.fn();
  authenticatedAPIClient.getUserProfile = mockGetUserProfile;
  authenticatedAPIClient.isAuthenticated = jest.fn();
  authenticatedAPIClient.isAccessTokenExpired = jest.fn();
  authenticatedAPIClient.login = jest.fn();
  authenticatedAPIClient.logout = jest.fn();
  authenticatedAPIClient.refreshAccessToken = mockRefreshAccessToken;
  authenticatedAPIClient.isAuthUrl = jest.fn();
  authenticatedAPIClient.getCsrfToken = mockGetCsrfToken;
  authenticatedAPIClient.isCsrfExempt = jest.fn();
  authenticatedAPIClient.getDecodedAccessToken = jest.fn();
  /* eslint-enable no-param-reassign */
}
