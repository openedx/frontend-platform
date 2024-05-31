function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
import React from 'react';
import { injectIntl } from 'react-intl';
import { getLoggingService, intlShape } from './lib';

/**
 * This function wraps react-intl's injectIntl function in order to add error logging to the intl
 * property's formatMessage function.
 *
 * @memberof I18n
 */
var injectIntlWithShim = function injectIntlWithShim(WrappedComponent) {
  var ShimmedIntlComponent = /*#__PURE__*/function (_React$Component) {
    function ShimmedIntlComponent(props) {
      var _this;
      _classCallCheck(this, ShimmedIntlComponent);
      _this = _callSuper(this, ShimmedIntlComponent, [props]);
      _this.shimmedIntl = Object.create(_this.props.intl, {
        formatMessage: {
          value: function value(definition) {
            var _this$props$intl;
            if (definition === undefined || definition.id === undefined) {
              var error = new Error('i18n error: An undefined message was supplied to intl.formatMessage.');
              if (process.env.NODE_ENV !== 'production') {
                console.error(error); // eslint-disable-line no-console
                return '!!! Missing message supplied to intl.formatMessage !!!';
              }
              getLoggingService().logError(error);
              return ''; // Fail silently in production
            }
            for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
              args[_key - 1] = arguments[_key];
            }
            return (_this$props$intl = _this.props.intl).formatMessage.apply(_this$props$intl, [definition].concat(args));
          }
        }
      });
      return _this;
    }
    _inherits(ShimmedIntlComponent, _React$Component);
    return _createClass(ShimmedIntlComponent, [{
      key: "render",
      value: function render() {
        return /*#__PURE__*/React.createElement(WrappedComponent, _extends({}, this.props, {
          intl: this.shimmedIntl
        }));
      }
    }]);
  }(React.Component);
  ShimmedIntlComponent.propTypes = {
    intl: intlShape.isRequired
  };
  return injectIntl(ShimmedIntlComponent);
};
export default injectIntlWithShim;
//# sourceMappingURL=injectIntlWithShim.js.map