import React from 'react';
import { mount } from 'enzyme';

import LoginRedirect from './index';
import { configure } from '../AuthenticatedApiClient/index';

configure({
  appBaseUrl: process.env.BASE_URL,
  accessTokenCookieName: process.env.ACCESS_TOKEN_COOKIE_NAME,
  csrfTokenApiPath: '/get-csrf-token',
  loginUrl: process.env.LOGIN_URL,
  logoutUrl: process.env.LOGOUT_URL,
  refreshAccessTokenEndpoint: process.env.REFRESH_ACCESS_TOKEN_ENDPOINT,
  loggingService: {
    logError: jest.fn(),
    logInfo: jest.fn(),
  },
});

window.location.assign = jest.fn();

describe('LoginRedirect', () => {
  it('calls authenticatedAPIClient.login', () => {
    const redirect = 'https://example.com';
    mount((
      <LoginRedirect
        redirect={redirect}
      />
    ));

    const encodedRedirectUrl = encodeURIComponent(redirect);
    expect(window.location.assign)
      .toHaveBeenCalledWith(`${process.env.LOGIN_URL}?next=${encodedRedirectUrl}`);
  });
});
