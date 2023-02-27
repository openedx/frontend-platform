/**
 * #### Import members from **@edx/frontend-platform/react**
 * The React module provides a variety of React components, hooks, and contexts for use in an
 * application.
 *
 * @module React
 */

export { default as AppContext } from './AppContext';
export { default as AppProvider } from './AppProvider';
export { default as AuthenticatedPageRoute } from './AuthenticatedPageRoute';
export { default as ErrorBoundary } from './ErrorBoundary';
export { default as ErrorPage } from './ErrorPage';
export { default as LoginRedirect } from './LoginRedirect';
export { default as PageRoute } from './PageRoute';
export { useAppEvent, useParagonTheme } from './hooks';
export { paragonThemeActions } from './reducers';
export { PARAGON_THEME_VARIANT_LIGHT } from './constants';
