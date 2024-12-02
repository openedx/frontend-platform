function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Container, Row, Col } from '@openedx/paragon';
import { useAppEvent } from './hooks';
import { FormattedMessage, IntlProvider, getMessages, getLocale, LOCALE_CHANGED } from '../i18n';

/**
 * An error page that displays a generic message for unexpected errors.  Also contains a "Try
 * Again" button to refresh the page.
 *
 * @memberof module:React
 * @extends {Component}
 */
function ErrorPage(_ref) {
  var message = _ref.message;
  var _useState = useState(getLocale()),
    _useState2 = _slicedToArray(_useState, 2),
    locale = _useState2[0],
    setLocale = _useState2[1];
  useAppEvent(LOCALE_CHANGED, function () {
    setLocale(getLocale());
  });

  /* istanbul ignore next */
  var reload = function reload() {
    global.location.reload();
  };
  return /*#__PURE__*/React.createElement(IntlProvider, {
    locale: locale,
    messages: getMessages()
  }, /*#__PURE__*/React.createElement(Container, {
    fluid: true,
    className: "py-5 justify-content-center align-items-start text-center",
    "data-testid": "error-page"
  }, /*#__PURE__*/React.createElement(Row, null, /*#__PURE__*/React.createElement(Col, null, /*#__PURE__*/React.createElement("p", {
    className: "text-muted"
  }, /*#__PURE__*/React.createElement(FormattedMessage, {
    id: "unexpected.error.message.text",
    defaultMessage: "An unexpected error occurred. Please click the button below to refresh the page.",
    description: "error message when an unexpected error occurs"
  })), message && /*#__PURE__*/React.createElement("div", {
    role: "alert",
    className: "my-4"
  }, /*#__PURE__*/React.createElement("p", null, message)), /*#__PURE__*/React.createElement(Button, {
    onClick: reload
  }, /*#__PURE__*/React.createElement(FormattedMessage, {
    id: "unexpected.error.button.text",
    defaultMessage: "Try again",
    description: "text for button that tries to reload the app by refreshing the page"
  }))))));
}
ErrorPage.propTypes = {
  message: PropTypes.string
};
ErrorPage.defaultProps = {
  message: null
};
export default ErrorPage;
//# sourceMappingURL=ErrorPage.js.map