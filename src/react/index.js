/**
 * #### Import members from **@edx/frontend-platform/react**
 * The React module provides a variety of React components, hooks, and contexts for use in an
 * application.
 *
 * @module React
 */

export { default as AppContext } from './AppContext.jsx';
export { default as AppProvider } from './AppProvider.jsx';
export { default as AuthenticatedPageRoute } from './AuthenticatedPageRoute.jsx';
export { default as ErrorBoundary } from './ErrorBoundary.jsx';
export { default as ErrorPage } from './ErrorPage.jsx';
export { default as LoginRedirect } from './LoginRedirect.jsx';
export { default as PageWrap } from './PageWrap.jsx';
export { useAppEvent } from './hooks.js';

// Export types too - required for interfaces to be documented by TypeDoc:
/** @typedef {import('./AppContext.js').IAppContext} IAppContext */
