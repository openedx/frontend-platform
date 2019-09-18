import configuration, { env } from './configuration';

it('should create a history object', async () => {
  const app = {
    config: null,
  };

  // This is checking 1) that the promise resolved and 2) that the return value is undefined, which
  // is what we want.
  await expect(configuration(app)).resolves.toBe(undefined);

  expect(app.config).toEqual({
    ACCESS_TOKEN_COOKIE_NAME: 'edx-jwt-cookie-header-payload',
    BASE_URL: 'localhost:1995',
    CREDENTIALS_BASE_URL: 'http://localhost:18150',
    CSRF_COOKIE_NAME: 'csrftoken',
    CSRF_TOKEN_API_PATH: '/csrf/api/v1/token',
    ECOMMERCE_BASE_URL: 'http://localhost:18130',
    ENVIRONMENT: 'test',
    LANGUAGE_PREFERENCE_COOKIE_NAME: 'openedx-language-preference',
    LMS_BASE_URL: 'http://localhost:18000',
    LOGIN_URL: 'http://localhost:18000/login',
    LOGOUT_URL: 'http://localhost:18000/login',
    MARKETING_SITE_BASE_URL: 'http://localhost:18000',
    ORDER_HISTORY_URL: 'localhost:1996/orders',
    REFRESH_ACCESS_TOKEN_ENDPOINT: 'http://localhost:18000/login_refresh',
    SECURE_COOKIES: true,
    SEGMENT_KEY: 'segment_whoa',
    SITE_NAME: 'edX',
    USER_INFO_COOKIE_NAME: 'edx-user-info',
  });
});

describe('throwing a validation error', () => {
  beforeEach(() => {
    env.ACCESS_TOKEN_COOKIE_NAME = undefined;
  });

  afterEach(() => {
    env.ACCESS_TOKEN_COOKIE_NAME = process.env.ACCESS_TOKEN_COOKIE_NAME;
  });

  it('should validate that the configuration document is correct', async () => {
    env.ACCESS_TOKEN_COOKIE_NAME = undefined;
    const app = {
      config: null,
    };

    await expect(configuration(app)).rejects.toThrow();
  });
});
