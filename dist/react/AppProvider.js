function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter as Router } from 'react-router-dom';
import OptionalReduxProvider from './OptionalReduxProvider';
import ErrorBoundary from './ErrorBoundary';
import AppContext from './AppContext';
import { useAppEvent, useParagonTheme, useTrackColorSchemeChoice } from './hooks';
import { paragonThemeActions } from './reducers';
import { getAuthenticatedUser, AUTHENTICATED_USER_CHANGED } from '../auth';
import { getConfig } from '../config';
import { CONFIG_CHANGED } from '../constants';
import { getLocale, getMessages, IntlProvider, LOCALE_CHANGED } from '../i18n';
import { basename } from '../initialize';
import { SELECTED_THEME_VARIANT_KEY } from './constants';

/**
 * A wrapper component for React-based micro-frontends to initialize a number of common data/
 * context providers.
 *
 * ```
 * subscribe(APP_READY, () => {
 *   ReactDOM.render(
 *     <AppProvider>
 *       <HelloWorld />
 *     </AppProvider>
 *   )
 * });
 * ```
 *
 * This will provide the following to HelloWorld:
 * - An error boundary as described above.
 * - An `AppContext` provider for React context data.
 * - IntlProvider for @edx/frontend-i18n internationalization
 * - Optionally a redux `Provider`. Will only be included if a `store` property is passed to
 * `AppProvider`.
 * - A `Router` for react-router.
 * - A theme manager for Paragon.
 *
 * @param {Object} props
 * @param {Object} [props.store] A redux store.
 * @memberof module:React
 */
export default function AppProvider(_ref) {
  var store = _ref.store,
    children = _ref.children,
    wrapWithRouter = _ref.wrapWithRouter;
  var _useState = useState(getConfig()),
    _useState2 = _slicedToArray(_useState, 2),
    config = _useState2[0],
    setConfig = _useState2[1];
  var _useState3 = useState(getAuthenticatedUser()),
    _useState4 = _slicedToArray(_useState3, 2),
    authenticatedUser = _useState4[0],
    setAuthenticatedUser = _useState4[1];
  var _useState5 = useState(getLocale()),
    _useState6 = _slicedToArray(_useState5, 2),
    locale = _useState6[0],
    setLocale = _useState6[1];
  useAppEvent(AUTHENTICATED_USER_CHANGED, function () {
    setAuthenticatedUser(getAuthenticatedUser());
  });
  useAppEvent(CONFIG_CHANGED, function () {
    setConfig(getConfig());
  });
  useAppEvent(LOCALE_CHANGED, function () {
    setLocale(getLocale());
  });
  useTrackColorSchemeChoice();
  var _useParagonTheme = useParagonTheme(config),
    _useParagonTheme2 = _slicedToArray(_useParagonTheme, 2),
    paragonThemeState = _useParagonTheme2[0],
    paragonThemeDispatch = _useParagonTheme2[1];
  var appContextValue = useMemo(function () {
    return {
      authenticatedUser: authenticatedUser,
      config: config,
      locale: locale,
      paragonTheme: {
        state: paragonThemeState,
        setThemeVariant: function setThemeVariant(themeVariant) {
          paragonThemeDispatch(paragonThemeActions.setParagonThemeVariant(themeVariant));

          // Persist selected theme variant to localStorage.
          window.localStorage.setItem(SELECTED_THEME_VARIANT_KEY, themeVariant);
        }
      }
    };
  }, [authenticatedUser, config, locale, paragonThemeState, paragonThemeDispatch]);
  if (!(paragonThemeState !== null && paragonThemeState !== void 0 && paragonThemeState.isThemeLoaded)) {
    return null;
  }
  return /*#__PURE__*/React.createElement(IntlProvider, {
    locale: locale,
    messages: getMessages()
  }, /*#__PURE__*/React.createElement(ErrorBoundary, null, /*#__PURE__*/React.createElement(AppContext.Provider, {
    value: appContextValue
  }, /*#__PURE__*/React.createElement(OptionalReduxProvider, {
    store: store
  }, wrapWithRouter ? /*#__PURE__*/React.createElement(Router, {
    basename: basename
  }, /*#__PURE__*/React.createElement("div", {
    "data-testid": "browser-router"
  }, children)) : children))));
}
AppProvider.propTypes = {
  store: PropTypes.shape({}),
  children: PropTypes.node.isRequired,
  wrapWithRouter: PropTypes.bool
};
AppProvider.defaultProps = {
  store: null,
  wrapWithRouter: true
};
//# sourceMappingURL=AppProvider.js.map