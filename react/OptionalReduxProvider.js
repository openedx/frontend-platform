import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
/**
 * @memberof module:React
 * @param {Object} props
 */

export default function OptionalReduxProvider(_ref) {
  var store = _ref.store,
      children = _ref.children;

  if (store === null) {
    return /*#__PURE__*/React.createElement(React.Fragment, null, children);
  }

  return /*#__PURE__*/React.createElement(Provider, {
    store: store
  }, children);
}
OptionalReduxProvider.propTypes = {
  store: PropTypes.object,
  // eslint-disable-line
  children: PropTypes.node.isRequired
};
OptionalReduxProvider.defaultProps = {
  store: null
};
//# sourceMappingURL=OptionalReduxProvider.js.map