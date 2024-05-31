function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * @implements {GoogleAnalyticsLoader}
 * @memberof module:GoogleAnalytics
 */
var GoogleAnalyticsLoader = /*#__PURE__*/function () {
  function GoogleAnalyticsLoader(_ref) {
    var config = _ref.config;
    _classCallCheck(this, GoogleAnalyticsLoader);
    this.analyticsId = config.GOOGLE_ANALYTICS_4_ID;
  }
  return _createClass(GoogleAnalyticsLoader, [{
    key: "loadScript",
    value: function loadScript() {
      if (!this.analyticsId) {
        return;
      }
      global.googleAnalytics = global.googleAnalytics || [];
      var _global = global,
        googleAnalytics = _global.googleAnalytics;

      // If the snippet was invoked do nothing.
      if (googleAnalytics.invoked) {
        return;
      }

      // Invoked flag, to make sure the snippet
      // is never invoked twice.
      googleAnalytics.invoked = true;
      googleAnalytics.load = function (key, options) {
        var scriptSrc = document.createElement('script');
        scriptSrc.type = 'text/javascript';
        scriptSrc.async = true;
        scriptSrc.src = "https://www.googletagmanager.com/gtag/js?id=".concat(key);
        var scriptGtag = document.createElement('script');
        scriptGtag.innerHTML = "\n        window.dataLayer = window.dataLayer || [];\n        function gtag(){dataLayer.push(arguments);}\n        gtag('js', new Date());\n        gtag('config', '".concat(key, "');\n      ");

        // Insert our scripts next to the first script element.
        var first = document.getElementsByTagName('script')[0];
        first.parentNode.insertBefore(scriptSrc, first);
        first.parentNode.insertBefore(scriptGtag, first);
        googleAnalytics._loadOptions = options; // eslint-disable-line no-underscore-dangle
      };

      // Load GoogleAnalytics with your key.
      googleAnalytics.load(this.analyticsId);
    }
  }]);
}();
export default GoogleAnalyticsLoader;
//# sourceMappingURL=GoogleAnalyticsLoader.js.map