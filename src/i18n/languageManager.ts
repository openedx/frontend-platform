import { handleRtl, LOCALE_CHANGED } from './lib';
import { publish } from '../pubSub';
import { logError } from '../logging';
import { updateAuthenticatedUserPreferences, setSessionLanguage } from './languageApi';

/**
 * Changes the user's language preference and applies it to the current session.
 *
 * This comprehensive function handles the complete language change process:
 * 1. Sets the language cookie with the selected language code
 * 2. If a user is authenticated, updates their server-side preference in the backend
 * 3. Updates the session language through the setlang endpoint
 * 4. Publishes a locale change event to notify other parts of the application
 *
 * @param {string} languageCode - The selected language locale code (e.g., 'en', 'es-419', 'ar', 'de-de').
 *                                Should be a valid ISO language code supported by the platform. For reference:
 *                                https://github.com/openedx/openedx-platform/blob/master/openedx/envs/common.py#L231
 * @param {boolean} [forceReload=false] - Whether to force a page reload after changing the language.
 * @returns {Promise} - A promise that resolves when all operations complete.
 *
 */
export async function changeUserSessionLanguage(
  languageCode: string,
  forceReload: boolean = false,
): Promise<void> {
  try {
    await updateAuthenticatedUserPreferences({ prefLang: languageCode });
    await setSessionLanguage(languageCode);
    handleRtl();
    publish(LOCALE_CHANGED, languageCode);
  } catch (error: any) {
    logError(error);
  }

  if (forceReload) {
    window.location.reload();
  }
}
