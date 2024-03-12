import React from 'react';
import PropTypes from 'prop-types';

const TestComponent = ({ handleClick, title }) => (
  <button type="button" onClick={handleClick} data-testid="button-test">
    {title}
  </button>
);

TestComponent.defaultProps = {
  handleClick: () => {},
};

TestComponent.propTypes = {
  handleClick: PropTypes.func,
  title: PropTypes.string.isRequired,
};

export default TestComponent;
