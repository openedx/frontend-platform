function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

import { processAxiosError } from '../utils';

var createProcessAxiosRequestErrorInterceptor = function createProcessAxiosRequestErrorInterceptor(options) {
  var loggingService = options.loggingService; // Creating the interceptor inside this closure to
  // maintain reference to the options supplied.

  var interceptor = /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(error) {
      var processedError, httpErrorStatus;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              processedError = processAxiosError(error);
              httpErrorStatus = processedError.customAttributes.httpErrorStatus;

              if (httpErrorStatus === 401 || httpErrorStatus === 403) {
                loggingService.logInfo(processedError.message, processedError.customAttributes);
              }

              return _context.abrupt("return", Promise.reject(processedError));

            case 4:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function interceptor(_x) {
      return _ref.apply(this, arguments);
    };
  }();

  return interceptor;
};

export default createProcessAxiosRequestErrorInterceptor;
//# sourceMappingURL=createProcessAxiosRequestErrorInterceptor.js.map