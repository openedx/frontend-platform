import { useEffect } from 'react';
import { loginRedirect } from './data/service';
/**
 * Wraps the call to loginRedirect in a Component.
 */
export default function LoginRedirect() {
  useEffect(() => {
    loginRedirect();
  }, []);
  return null;
}
