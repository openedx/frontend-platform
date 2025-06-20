import { getConfig } from '../config';
import { getAuthenticatedHttpClient } from '../auth';
import { convertKeyNames, snakeCaseObject } from '../utils';

/**
 * Updates user language preferences via the preferences API.
 *
 * This function converts preference data to snake_case and formats specific keys
 * according to backend requirements before sending the PATCH request.
 *
 * @param {string} username - The username of the user whose preferences to update.
 * @param {Object} preferenceData - The preference parameters to update (e.g., { prefLang: 'en' }).
 * @returns {Promise} - A promise that resolves when the API call completes successfully,
 *                      or rejects if there's an error with the request.
 */
export async function updateUserPreferences(username, preferenceData) {
  const snakeCaseData = snakeCaseObject(preferenceData);
  const formattedData = convertKeyNames(snakeCaseData, {
    pref_lang: 'pref-lang',
  });

  return getAuthenticatedHttpClient().patch(
    `${getConfig().LMS_BASE_URL}/api/user/v1/preferences/${username}`,
    formattedData,
    { headers: { 'Content-Type': 'application/merge-patch+json' } },
  );
}

/**
 * Sets the language for the current session using the setlang endpoint.
 *
 * This function sends a POST request to the LMS setlang endpoint to change
 * the language for the current user session.
 *
 * @param {string} languageCode - The language code to set (e.g., 'en', 'es', 'ar').
 *                               Should be a valid ISO language code supported by the platform.
 * @returns {Promise} - A promise that resolves when the API call completes successfully,
 *                      or rejects if there's an error with the request.
 */
export async function setSessionLanguage(languageCode) {
  const formData = new FormData();
  formData.append('language', languageCode);

  return getAuthenticatedHttpClient().post(
    `${getConfig().LMS_BASE_URL}/i18n/setlang/`,
    formData,
    {
      headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    },
  );
}
