/* eslint-disable import/no-extraneous-dependencies */

import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import 'babel-polyfill';

Enzyme.configure({ adapter: new Adapter() });

// These configuration values are usually set in webpack's EnvironmentPlugin however
// Jest does not use webpack so we need to set these so for testing
process.env.ACCESS_TOKEN_COOKIE_NAME = 'edx-jwt-cookie-header-payload';
process.env.BASE_URL = 'localhost:1995';
process.env.CREDENTIALS_BASE_URL = 'http://localhost:18150';
process.env.CSRF_COOKIE_NAME = 'csrftoken';
process.env.CSRF_TOKEN_API_PATH = '/csrf/api/v1/token';
process.env.ECOMMERCE_BASE_URL = 'http://localhost:18130';
process.env.LANGUAGE_PREFERENCE_COOKIE_NAME = 'openedx-language-preference';
process.env.LMS_BASE_URL = 'http://localhost:18000';
process.env.LOGIN_URL = 'http://localhost:18000/login';
process.env.LOGOUT_URL = 'http://localhost:18000/login';
process.env.MARKETING_SITE_BASE_URL = 'http://localhost:18000';
process.env.ORDER_HISTORY_URL = 'localhost:1996/orders';
process.env.REFRESH_ACCESS_TOKEN_ENDPOINT = 'http://localhost:18000/login_refresh';
process.env.SEGMENT_KEY = 'segment_whoa';
process.env.SITE_NAME = 'edX';
process.env.USER_INFO_COOKIE_NAME = 'edx-user-info';
