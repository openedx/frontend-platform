import { changeUserSessionLanguage } from './languageManager';
import { getConfig } from '../config';
import { getAuthenticatedUser } from '../auth';
import { getCookies, handleRtl, LOCALE_CHANGED } from './lib';
import { logError } from '../logging';
import { publish } from '../pubSub';
import { updateUserPreferences, setSessionLanguage } from './languageApi';

jest.mock('../config');
jest.mock('../auth');
jest.mock('./lib');
jest.mock('../logging');
jest.mock('../pubSub');
jest.mock('./languageApi');

const LMS_BASE_URL = 'http://test.lms';
const LANGUAGE_PREFERENCE_COOKIE_NAME = 'lang';

describe('languageManager', () => {
  let mockCookies;
  let mockUser;
  let mockReload;

  beforeEach(() => {
    jest.clearAllMocks();
    getConfig.mockReturnValue({
      LMS_BASE_URL,
      LANGUAGE_PREFERENCE_COOKIE_NAME,
    });

    mockCookies = { set: jest.fn() };
    getCookies.mockReturnValue(mockCookies);

    mockUser = { username: 'testuser', userId: '123' };
    getAuthenticatedUser.mockReturnValue(mockUser);

    mockReload = jest.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: { reload: mockReload },
    });

    updateUserPreferences.mockResolvedValue({});
    setSessionLanguage.mockResolvedValue({});
  });

  describe('changeUserSessionLanguage', () => {
    it('should perform complete language change process', async () => {
      await changeUserSessionLanguage('fr');

      expect(getCookies().set).toHaveBeenCalledWith(
        LANGUAGE_PREFERENCE_COOKIE_NAME,
        'fr',
      );
      expect(updateUserPreferences).toHaveBeenCalledWith('testuser', {
        prefLang: 'fr',
      });
      expect(setSessionLanguage).toHaveBeenCalledWith('fr');
      expect(handleRtl).toHaveBeenCalledWith('fr');
      expect(publish).toHaveBeenCalledWith(LOCALE_CHANGED, 'fr');
      expect(mockReload).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      updateUserPreferences.mockRejectedValue(new Error('fail'));
      await changeUserSessionLanguage('es', true);
      expect(logError).toHaveBeenCalled();
    });

    it('should skip updateUserPreferences if user is not authenticated', async () => {
      getAuthenticatedUser.mockReturnValue(null);
      await changeUserSessionLanguage('en', true);
      expect(updateUserPreferences).not.toHaveBeenCalled();
    });

    it('should reload if forceReload is true', async () => {
      await changeUserSessionLanguage('de', true);
      expect(mockReload).toHaveBeenCalled();
    });
  });
});
