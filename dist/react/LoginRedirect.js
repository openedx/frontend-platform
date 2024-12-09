import { useEffect } from 'react';
import { redirectToLogin } from '../auth';

/**
 * A React component that, when rendered, redirects to the login page as a side effect.  Uses
 * `redirectToLogin` to perform the redirect.
 *
 * @see {@link module:frontend-platform/auth~redirectToLogin}
 * @memberof module:React
 */
export default function LoginRedirect() {
  useEffect(function () {
    redirectToLogin(global.location.href);
  }, []);
  return null;
}
//# sourceMappingURL=LoginRedirect.js.map