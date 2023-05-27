import PubSub from 'pubsub-js';
import { initialize } from './initialize';

import {
  logError,
} from './logging';
import {
  ensureAuthenticatedUser,
  fetchAuthenticatedUser,
  hydrateAuthenticatedUser,
} from './auth';
import { getConfig } from './config';

jest.mock('./logging');
jest.mock('./auth');
jest.mock('./analytics');
jest.mock('./i18n');
jest.mock('./auth/LocalForageCache');
jest.mock('env.config.js', () => () => ({
  JS_FILE_VAR: 'JS_FILE_VAR_VALUE_FUNCTION',
}));

let config = null;

describe('initialize with function js file config', () => {
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

    expect(config.JS_FILE_VAR).toEqual('JS_FILE_VAR_VALUE_FUNCTION');
  });
});
