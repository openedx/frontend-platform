import React from 'react';
import PropTypes from 'prop-types';

function TestComponent({ handleClick, title }) {
  return (
    <button type="button" onClick={handleClick} data-testid="button-test">
      {title}
    </button>
  );
}

TestComponent.defaultProps = {
  handleClick: () => {},
};

TestComponent.propTypes = {
  handleClick: PropTypes.func,
  title: PropTypes.string.isRequired,
};

export default TestComponent;
