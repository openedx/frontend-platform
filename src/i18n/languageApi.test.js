import { updateUserPreferences, setSessionLanguage } from './languageApi';
import { getConfig } from '../config';
import { getAuthenticatedHttpClient } from '../auth';

jest.mock('../config');
jest.mock('../auth');

const LMS_BASE_URL = 'http://test.lms';

describe('languageApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getConfig.mockReturnValue({ LMS_BASE_URL });
  });

  describe('updateUserPreferences', () => {
    it('should send a PATCH request with correct data', async () => {
      const patchMock = jest.fn().mockResolvedValue({});
      getAuthenticatedHttpClient.mockReturnValue({ patch: patchMock });

      await updateUserPreferences('user1', { prefLang: 'es' });

      expect(patchMock).toHaveBeenCalledWith(
        `${LMS_BASE_URL}/api/user/v1/preferences/user1`,
        expect.any(Object),
        expect.objectContaining({ headers: expect.any(Object) }),
      );
    });
  });

  describe('setSessionLanguage', () => {
    it('should send a POST request to setlang endpoint', async () => {
      const postMock = jest.fn().mockResolvedValue({});
      getAuthenticatedHttpClient.mockReturnValue({ post: postMock });

      await setSessionLanguage('ar');

      expect(postMock).toHaveBeenCalledWith(
        `${LMS_BASE_URL}/i18n/setlang/`,
        expect.any(FormData),
        expect.objectContaining({ headers: expect.any(Object) }),
      );
    });
  });
});
