import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';

/**
 * @memberof module:React
 * @param {Object} props
 */
export default function OptionalReduxProvider(_ref) {
  var _ref$store = _ref.store,
    store = _ref$store === void 0 ? null : _ref$store,
    children = _ref.children;
  if (store === null) {
    return children;
  }
  return /*#__PURE__*/React.createElement(Provider, {
    store: store
  }, /*#__PURE__*/React.createElement("div", {
    "data-testid": "redux-provider"
  }, children));
}
OptionalReduxProvider.propTypes = {
  store: PropTypes.shape(),
  children: PropTypes.node.isRequired
};
//# sourceMappingURL=OptionalReduxProvider.js.map