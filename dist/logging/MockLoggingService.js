function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * The MockLoggingService implements both logInfo and logError as jest mock functions via
 * jest.fn().  It has no other functionality.
 *
 * @implements {LoggingService}
 * @memberof module:Logging
 */
var MockLoggingService = /*#__PURE__*/_createClass(function MockLoggingService() {
  _classCallCheck(this, MockLoggingService);
  /**
   * Implemented as a jest.fn()
   *
   * @memberof MockLoggingService
   */
  _defineProperty(this, "logInfo", jest.fn());
  /**
   * Implemented as a jest.fn()
   *
   * @memberof MockLoggingService
   */
  _defineProperty(this, "logError", jest.fn());
  /**
   * Implemented as a jest.fn()
   *
   * @memberof MockLoggingService
   */
  _defineProperty(this, "setCustomAttribute", jest.fn());
});
export default MockLoggingService;
//# sourceMappingURL=MockLoggingService.js.map