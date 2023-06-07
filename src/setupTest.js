/* eslint-disable import/no-extraneous-dependencies */
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import Enzyme from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';

Enzyme.configure({ adapter: new Adapter() });

// These configuration values are usually set in webpack's EnvironmentPlugin however
// Jest does not use webpack so we need to set these so for testing
process.env.ACCESS_TOKEN_COOKIE_NAME = 'edx-jwt-cookie-header-payload';
process.env.ACCOUNT_PROFILE_URL = 'http://localhost:1995';
process.env.ACCOUNT_SETTINGS_URL = 'http://localhost:1997';
process.env.BASE_URL = 'localhost:8080';
process.env.CREDENTIALS_BASE_URL = 'http://localhost:18150';
process.env.CSRF_TOKEN_API_PATH = '/csrf/api/v1/token';
process.env.DISCOVERY_API_BASE_URL = 'http://localhost:18381';
process.env.PUBLISHER_BASE_URL = 'http://localhost:18400';
process.env.ECOMMERCE_BASE_URL = 'http://localhost:18130';
process.env.LANGUAGE_PREFERENCE_COOKIE_NAME = 'openedx-language-preference';
process.env.LMS_BASE_URL = 'http://localhost:18000';
process.env.LEARNING_BASE_URL = 'http://localhost:2000';
process.env.LOGIN_URL = 'http://localhost:18000/login';
process.env.LOGOUT_URL = 'http://localhost:18000/logout';
process.env.STUDIO_BASE_URL = 'http://localhost:18010';
process.env.MARKETING_SITE_BASE_URL = 'http://localhost:18000';
process.env.ORDER_HISTORY_URL = 'localhost:1996/orders';
process.env.REFRESH_ACCESS_TOKEN_ENDPOINT = 'http://localhost:18000/login_refresh';
process.env.SEGMENT_KEY = 'segment_whoa';
process.env.SITE_NAME = 'edX';
process.env.USER_INFO_COOKIE_NAME = 'edx-user-info';
process.env.LOGO_URL = 'https://edx-cdn.org/v3/default/logo.svg';
process.env.LOGO_TRADEMARK_URL = 'https://edx-cdn.org/v3/default/logo-trademark.svg';
process.env.LOGO_WHITE_URL = 'https://edx-cdn.org/v3/default/logo-white.svg';
process.env.FAVICON_URL = 'https://edx-cdn.org/v3/default/favicon.ico';
process.env.MFE_CONFIG_API_URL = '';
process.env.APP_ID = '';
process.env.SUPPORT_URL = 'https://support.edx.org';

/* Auth test variables

process.env.BASE_URL = 'http://example.com';
process.env.LMS_BASE_URL = 'http://auth.example.com';
process.env.LOGIN_URL = 'http://auth.example.com/login';
process.env.LOGOUT_URL = 'http://auth.example.com/logout';
process.env.REFRESH_ACCESS_TOKEN_ENDPOINT = 'http://auth.example.com/api/refreshToken';
process.env.ACCESS_TOKEN_COOKIE_NAME = 'access-token-cookie-name';
process.env.USER_INFO_COOKIE_NAME = 'user-info-cookie-name';

*/
