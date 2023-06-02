/* eslint-disable import/prefer-default-export */
import PropTypes from 'prop-types';
import { IFRAME_PLUGIN } from './constants';

export const pluginConfigShape = PropTypes.shape({
  url: PropTypes.string.isRequired,
  type: PropTypes.oneOf([IFRAME_PLUGIN]).isRequired,
  // This is a place for us to put any generic props we want to pass to the component.  We need it.
  props: PropTypes.object, // eslint-disable-line react/forbid-prop-types
});
