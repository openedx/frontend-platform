function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

import axios from 'axios';
import { getUrlParts, processAxiosErrorAndThrow } from './utils';

var AxiosCsrfTokenService = /*#__PURE__*/function () {
  function AxiosCsrfTokenService(csrfTokenApiPath) {
    _classCallCheck(this, AxiosCsrfTokenService);

    this.csrfTokenApiPath = csrfTokenApiPath;
    this.httpClient = axios.create(); // Set withCredentials to true. Enables cross-site Access-Control requests
    // to be made using cookies, authorization headers or TLS client
    // certificates. More on MDN:
    // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials

    this.httpClient.defaults.withCredentials = true;
    this.httpClient.defaults.headers.common['USE-JWT-COOKIE'] = true;
    this.csrfTokenCache = {};
    this.csrfTokenRequestPromises = {};
  }

  _createClass(AxiosCsrfTokenService, [{
    key: "getCsrfToken",
    value: function () {
      var _getCsrfToken = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(url) {
        var _this = this;

        var urlParts, _urlParts, protocol, domain, csrfToken;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                try {
                  urlParts = getUrlParts(url);
                } catch (e) {
                  // If the url is not parsable it's likely because a relative
                  // path was supplied as the url. This is acceptable and in
                  // this case we should use the current origin of the page.
                  urlParts = getUrlParts(global.location.origin);
                }

                _urlParts = urlParts, protocol = _urlParts.protocol, domain = _urlParts.domain;
                csrfToken = this.csrfTokenCache[domain];

                if (!csrfToken) {
                  _context.next = 5;
                  break;
                }

                return _context.abrupt("return", csrfToken);

              case 5:
                if (!this.csrfTokenRequestPromises[domain]) {
                  this.csrfTokenRequestPromises[domain] = this.httpClient.get("".concat(protocol, "://").concat(domain).concat(this.csrfTokenApiPath)).then(function (response) {
                    _this.csrfTokenCache[domain] = response.data.csrfToken;
                    return _this.csrfTokenCache[domain];
                  })["catch"](processAxiosErrorAndThrow)["finally"](function () {
                    delete _this.csrfTokenRequestPromises[domain];
                  });
                }

                return _context.abrupt("return", this.csrfTokenRequestPromises[domain]);

              case 7:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function getCsrfToken(_x) {
        return _getCsrfToken.apply(this, arguments);
      }

      return getCsrfToken;
    }()
  }, {
    key: "clearCsrfTokenCache",
    value: function clearCsrfTokenCache() {
      this.csrfTokenCache = {};
    }
  }, {
    key: "getHttpClient",
    value: function getHttpClient() {
      return this.httpClient;
    }
  }]);

  return AxiosCsrfTokenService;
}();

export { AxiosCsrfTokenService as default };
//# sourceMappingURL=AxiosCsrfTokenService.js.map