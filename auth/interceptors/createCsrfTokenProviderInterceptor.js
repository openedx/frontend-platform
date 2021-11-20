function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var createCsrfTokenProviderInterceptor = function createCsrfTokenProviderInterceptor(options) {
  var csrfTokenService = options.csrfTokenService,
      CSRF_TOKEN_API_PATH = options.CSRF_TOKEN_API_PATH,
      shouldSkip = options.shouldSkip; // Creating the interceptor inside this closure to
  // maintain reference to the options supplied.

  var interceptor = /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(axiosRequestConfig) {
      var url, csrfToken, requestError, CSRF_HEADER_NAME;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (!shouldSkip(axiosRequestConfig)) {
                _context.next = 2;
                break;
              }

              return _context.abrupt("return", axiosRequestConfig);

            case 2:
              url = axiosRequestConfig.url;
              _context.prev = 3;
              _context.next = 6;
              return csrfTokenService.getCsrfToken(url, CSRF_TOKEN_API_PATH);

            case 6:
              csrfToken = _context.sent;
              _context.next = 15;
              break;

            case 9:
              _context.prev = 9;
              _context.t0 = _context["catch"](3);
              requestError = Object.create(_context.t0);
              requestError.message = "[getCsrfToken] ".concat(requestError.message); // Important: return the original axios request config

              requestError.config = axiosRequestConfig;
              return _context.abrupt("return", Promise.reject(requestError));

            case 15:
              CSRF_HEADER_NAME = 'X-CSRFToken'; // eslint-disable-next-line no-param-reassign

              axiosRequestConfig.headers[CSRF_HEADER_NAME] = csrfToken;
              return _context.abrupt("return", axiosRequestConfig);

            case 18:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[3, 9]]);
    }));

    return function interceptor(_x) {
      return _ref.apply(this, arguments);
    };
  }();

  return interceptor;
};

export default createCsrfTokenProviderInterceptor;
//# sourceMappingURL=createCsrfTokenProviderInterceptor.js.map