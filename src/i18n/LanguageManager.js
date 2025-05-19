/**
 * LanguageManager.js
 *
 * Provides utility functions for updating the session language preferences for users.
 */

import { getConfig } from '../config';
import { getAuthenticatedHttpClient, getAuthenticatedUser } from '../auth';
import { convertKeyNames, snakeCaseObject } from '../utils';
import { getCookies, handleRtl, LOCALE_CHANGED } from './lib';
import { logError } from '../logging';
import { publish } from '../pubSub';

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

  const url = `${getConfig().LMS_BASE_URL}/i18n/setlang/`;
  return getAuthenticatedHttpClient().post(url, formData, {
    headers: {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
  });
}

/**
 * Changes the user's language preference and applies it to the current session.
 *
 * This comprehensive function handles the complete language change process:
 * 1. Sets the language cookie with the selected language code
 * 2. If a user is authenticated, updates their server-side preference in the backend
 * 3. Updates the session language through the setlang endpoint
 * 4. Publishes a locale change event to notify other parts of the application
 *
 * @param {string} languageCode - The selected language locale code (e.g., 'en', 'es', 'ar').
 *                               Should be a valid ISO language code supported by the platform.
 * @returns {Promise} - A promise that resolves when all operations complete.
 *
 */
export async function changeUserSessionLanguage(languageCode) {
  const cookies = getCookies();
  const cookieName = getConfig().LANGUAGE_PREFERENCE_COOKIE_NAME;
  cookies.set(cookieName, languageCode);

  try {
    const user = getAuthenticatedUser();
    if (user) {
      await updateUserPreferences(user.username, { prefLang: languageCode });
    }

    await setSessionLanguage(languageCode);
    handleRtl(languageCode);
    publish(LOCALE_CHANGED, languageCode);
  } catch (error) {
    logError(error);
  }

  // Force page reload to ensure complete translation application.
  // While some translations update via the publish event, many sections
  // of the platform are not configured to receive these events or
  // handle translations dynamically, requiring a full reload for consistency.
  window.location.reload();
}
