import { useEffect } from 'react';
import { redirectToLogin } from '../auth/index.js';

/**
 * A React component that, when rendered, redirects to the login page as a side effect.  Uses
 * `redirectToLogin` to perform the redirect.
 *
 * @see {@link module:frontend-platform/auth~redirectToLogin}
 */
export default function LoginRedirect() {
  useEffect(() => {
    redirectToLogin(global.location.href);
  }, []);
  return null;
}
