import PubSub from 'pubsub-js';
import { initialize } from './initialize.js';

import {
  logError,
} from './logging/index.js';
import {
  ensureAuthenticatedUser,
  fetchAuthenticatedUser,
  hydrateAuthenticatedUser,
} from './auth/index.js';
import { getConfig } from './config.js';

jest.mock('./logging/index.js');
jest.mock('./auth/index.js');
jest.mock('./analytics/index.js');
jest.mock('./i18n/index.js');
jest.mock('./auth/LocalForageCache.js');
jest.mock('env.config.js', () => ({
  JS_FILE_VAR: 'JS_FILE_VAR_VALUE_CONSTANT',
}));

let config = null;

describe('initialize with constant js file config', () => {
  beforeEach(() => {
    jest.resetModules();
    config = getConfig();
    fetchAuthenticatedUser.mockReset();
    ensureAuthenticatedUser.mockReset();
    hydrateAuthenticatedUser.mockReset();
    logError.mockReset();
    PubSub.clearAllSubscriptions();
  });

  it('should initialize the app with javascript file configuration', async () => {
    const messages = { i_am: 'a message' };
    await initialize({ messages });

    expect(config.JS_FILE_VAR).toEqual('JS_FILE_VAR_VALUE_CONSTANT');
  });
});
