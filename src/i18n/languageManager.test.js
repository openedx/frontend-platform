import { changeUserSessionLanguage } from './languageManager';
import { getConfig } from '../config';
import { getCookies, handleRtl, LOCALE_CHANGED } from './lib';
import { logError } from '../logging';
import { publish } from '../pubSub';
import { updateAuthenticatedUserPreferences, setSessionLanguage } from './languageApi';

jest.mock('../config');
jest.mock('./lib');
jest.mock('../logging');
jest.mock('../pubSub');
jest.mock('./languageApi');

const LMS_BASE_URL = 'http://test.lms';
const LANGUAGE_PREFERENCE_COOKIE_NAME = 'lang';

describe('languageManager', () => {
  let mockCookies;
  let mockReload;

  beforeEach(() => {
    jest.clearAllMocks();
    getConfig.mockReturnValue({
      LMS_BASE_URL,
      LANGUAGE_PREFERENCE_COOKIE_NAME,
    });

    mockCookies = { set: jest.fn() };
    getCookies.mockReturnValue(mockCookies);

    mockReload = jest.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: { reload: mockReload },
    });

    updateAuthenticatedUserPreferences.mockResolvedValue({});
    setSessionLanguage.mockResolvedValue({});
  });

  describe('changeUserSessionLanguage', () => {
    it('should perform complete language change process', async () => {
      await changeUserSessionLanguage('fr');

      expect(getCookies().set).toHaveBeenCalledWith(
        LANGUAGE_PREFERENCE_COOKIE_NAME,
        'fr',
      );
      expect(updateAuthenticatedUserPreferences).toHaveBeenCalledWith({
        prefLang: 'fr',
      });
      expect(setSessionLanguage).toHaveBeenCalledWith('fr');
      expect(handleRtl).toHaveBeenCalledWith('fr');
      expect(publish).toHaveBeenCalledWith(LOCALE_CHANGED, 'fr');
      expect(mockReload).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      updateAuthenticatedUserPreferences.mockRejectedValue(new Error('fail'));
      await changeUserSessionLanguage('es', true);
      expect(logError).toHaveBeenCalled();
    });

    it('should call updateAuthenticatedUserPreferences even when user is not authenticated', async () => {
      await changeUserSessionLanguage('en', true);
      expect(updateAuthenticatedUserPreferences).toHaveBeenCalledWith({
        prefLang: 'en',
      });
    });

    it('should reload if forceReload is true', async () => {
      await changeUserSessionLanguage('de', true);
      expect(mockReload).toHaveBeenCalled();
    });
  });
});
