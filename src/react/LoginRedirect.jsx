import { useEffect } from 'react';
import { redirectToLogin } from '../auth';

/**
 * Wraps the call to redirectToLogin in a Component.
 *
 * @memberof React
 */
export default function LoginRedirect() {
  useEffect(() => {
    redirectToLogin(global.location.href);
  }, []);
  return null;
}
