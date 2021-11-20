function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var createJwtTokenProviderInterceptor = function createJwtTokenProviderInterceptor(options) {
  var jwtTokenService = options.jwtTokenService,
      shouldSkip = options.shouldSkip; // Creating the interceptor inside this closure to
  // maintain reference to the options supplied.

  var interceptor = /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(axiosRequestConfig) {
      var requestError;
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
              _context.prev = 2;
              _context.next = 5;
              return jwtTokenService.getJwtToken();

            case 5:
              _context.next = 13;
              break;

            case 7:
              _context.prev = 7;
              _context.t0 = _context["catch"](2);
              requestError = Object.create(_context.t0);
              requestError.message = "[getJwtToken] ".concat(requestError.message); // Important: return the original axios request config

              requestError.config = axiosRequestConfig;
              return _context.abrupt("return", Promise.reject(requestError));

            case 13:
              // Add the proper headers to tell the server to look for the jwt cookie
              // eslint-disable-next-line no-param-reassign
              axiosRequestConfig.headers.common['USE-JWT-COOKIE'] = true;
              return _context.abrupt("return", axiosRequestConfig);

            case 15:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[2, 7]]);
    }));

    return function interceptor(_x) {
      return _ref.apply(this, arguments);
    };
  }();

  return interceptor;
};

export default createJwtTokenProviderInterceptor;
//# sourceMappingURL=createJwtTokenProviderInterceptor.js.map