import { updateAuthenticatedUserPreferences, setSessionLanguage } from './languageApi';
import { getConfig } from '../config';
import { getAuthenticatedHttpClient, getAuthenticatedUser } from '../auth';

jest.mock('../config');
jest.mock('../auth');

const LMS_BASE_URL = 'http://test.lms';

describe('languageApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getConfig as jest.Mock).mockReturnValue({ LMS_BASE_URL });
    (getAuthenticatedUser as jest.Mock).mockReturnValue({ username: 'testuser', userId: '123' });
  });

  describe('updateAuthenticatedUserPreferences', () => {
    it('should send a PATCH request with correct data', async () => {
      const patchMock = jest.fn().mockResolvedValue({});
      (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({ patch: patchMock });

      await updateAuthenticatedUserPreferences({ prefLang: 'es' });

      expect(patchMock).toHaveBeenCalledWith(
        `${LMS_BASE_URL}/api/user/v1/preferences/testuser`,
        expect.any(Object),
        expect.objectContaining({ headers: expect.any(Object) }),
      );
    });

    it('should return early if no authenticated user', async () => {
      const patchMock = jest.fn().mockResolvedValue({});
      (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({ patch: patchMock });
      (getAuthenticatedUser as jest.Mock).mockReturnValue(null);

      await updateAuthenticatedUserPreferences({ prefLang: 'es' });

      expect(patchMock).not.toHaveBeenCalled();
    });
  });

  describe('setSessionLanguage', () => {
    it('should send a POST request to setlang endpoint', async () => {
      const postMock = jest.fn().mockResolvedValue({});
      (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({ post: postMock });

      await setSessionLanguage('ar');

      expect(postMock).toHaveBeenCalledWith(
        `${LMS_BASE_URL}/i18n/setlang/`,
        expect.any(FormData),
        expect.objectContaining({ headers: expect.any(Object) }),
      );
    });
  });
});
