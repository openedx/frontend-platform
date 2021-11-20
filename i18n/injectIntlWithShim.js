function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

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

import React from 'react';
import { injectIntl, intlShape } from 'react-intl';
import { getLoggingService } from './lib';
/**
 * This function wraps react-intl's injectIntl function in order to add error logging to the intl
 * property's formatMessage function.
 *
 * @memberof I18n
 */

var injectIntlWithShim = function injectIntlWithShim(WrappedComponent) {
  var ShimmedIntlComponent = /*#__PURE__*/function (_React$Component) {
    _inherits(ShimmedIntlComponent, _React$Component);

    var _super = _createSuper(ShimmedIntlComponent);

    function ShimmedIntlComponent(props) {
      var _this;

      _classCallCheck(this, ShimmedIntlComponent);

      _this = _super.call(this, props);
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

    _createClass(ShimmedIntlComponent, [{
      key: "render",
      value: function render() {
        return /*#__PURE__*/React.createElement(WrappedComponent, _extends({}, this.props, {
          intl: this.shimmedIntl
        }));
      }
    }]);

    return ShimmedIntlComponent;
  }(React.Component);

  ShimmedIntlComponent.propTypes = {
    intl: intlShape.isRequired
  };
  return injectIntl(ShimmedIntlComponent);
};

export default injectIntlWithShim;
//# sourceMappingURL=injectIntlWithShim.js.map