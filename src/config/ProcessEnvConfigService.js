export const CONFIG_TOPIC = 'CONFIG';
export const CONFIG_CHANGED = `${CONFIG_TOPIC}.CHANGED`;

function validateConfig(config, requester) {
  Object.keys(config).forEach((key) => {
    if (config[key] === undefined) {
      throw new Error(`Module configuration error: ${key} is required by ${requester}.`);
    }
  });
}

function readProcessEnv() {
  const ENVIRONMENT = process.env.NODE_ENV;
  return {
    ACCESS_TOKEN_COOKIE_NAME: process.env.ACCESS_TOKEN_COOKIE_NAME,
    BASE_URL: process.env.BASE_URL,
    CREDENTIALS_BASE_URL: process.env.CREDENTIALS_BASE_URL,
    CSRF_TOKEN_API_PATH: process.env.CSRF_TOKEN_API_PATH,
    ECOMMERCE_BASE_URL: process.env.ECOMMERCE_BASE_URL,
    ENVIRONMENT,
    LANGUAGE_PREFERENCE_COOKIE_NAME: process.env.LANGUAGE_PREFERENCE_COOKIE_NAME,
    LMS_BASE_URL: process.env.LMS_BASE_URL,
    LOGIN_URL: process.env.LOGIN_URL,
    LOGOUT_URL: process.env.LOGOUT_URL,
    MARKETING_SITE_BASE_URL: process.env.MARKETING_SITE_BASE_URL,
    ORDER_HISTORY_URL: process.env.ORDER_HISTORY_URL,
    REFRESH_ACCESS_TOKEN_ENDPOINT: process.env.REFRESH_ACCESS_TOKEN_ENDPOINT,
    SECURE_COOKIES: ENVIRONMENT !== 'development',
    SEGMENT_KEY: process.env.SEGMENT_KEY,
    SITE_NAME: process.env.SITE_NAME,
    USER_INFO_COOKIE_NAME: process.env.USER_INFO_COOKIE_NAME,
  };
}

export default class ProcessEnvConfigService {
  constructor({ pubSubService }) {
    this.pubSubService = pubSubService;
    this.setConfig(readProcessEnv());
  }

  getConfig() {
    return this.config;
  }

  setConfig(config) {
    validateConfig(config);
    this.config = config;
    this.pubSubService.publish(CONFIG_CHANGED);
  }

  mergeConfig(config) {
    validateConfig(config);
    this.config = Object.assign(this.config, config);
    this.pubSubService.publish(CONFIG_CHANGED);
  }
}
