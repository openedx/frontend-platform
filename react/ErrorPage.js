function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Container, Row, Col } from '@edx/paragon';
import { FormattedMessage } from '../i18n';
/**
 * An error page that displays a generic message for unexpected errors.  Also contains a "Try
 * Again" button to refresh the page.
 *
 * @memberof module:React
 * @extends {Component}
 */

var ErrorPage = /*#__PURE__*/function (_Component) {
  _inherits(ErrorPage, _Component);

  var _super = _createSuper(ErrorPage);

  function ErrorPage() {
    _classCallCheck(this, ErrorPage);

    return _super.apply(this, arguments);
  }

  _createClass(ErrorPage, [{
    key: "reload",
    value:
    /* istanbul ignore next */
    function reload() {
      global.location.reload();
    }
  }, {
    key: "render",
    value: function render() {
      var message = this.props.message;
      return /*#__PURE__*/React.createElement(Container, {
        fluid: true,
        className: "py-5 justify-content-center align-items-start text-center"
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
        onClick: this.reload
      }, /*#__PURE__*/React.createElement(FormattedMessage, {
        id: "unexpected.error.button.text",
        defaultMessage: "Try again",
        description: "text for button that tries to reload the app by refreshing the page"
      })))));
    }
  }]);

  return ErrorPage;
}(Component);

ErrorPage.propTypes = {
  message: PropTypes.string
};
ErrorPage.defaultProps = {
  message: null
};
export default ErrorPage;
//# sourceMappingURL=ErrorPage.js.map