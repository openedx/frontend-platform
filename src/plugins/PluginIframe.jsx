import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { IFRAME_PLUGIN, LTI_PLUGIN, SCRIPT_PLUGIN } from './data/constants';

/**
 * Feature policy for iframe, allowing access to certain courseware-related media.
 *
 * We must use the wildcard (*) origin for each feature, as courseware content
 * may be embedded in external iframes. Notably, xblock-lti-consumer is a popular
 * block that iframes external course content.

 * This policy was selected in conference with the edX Security Working Group.
 * Changes to it should be vetted by them (security@edx.org).
 */
const IFRAME_FEATURE_POLICY = (
  'fullscreen; microphone *; camera *; midi *; geolocation *; encrypted-media *'
);

export default function PluginIframe({
  plugin, fallback, className, ...props
}) {
  const { url } = plugin;
  const { title, scrolling } = props;
  return (
    <iframe
      title={title}
      src={url}
      allow={IFRAME_FEATURE_POLICY}
      allowFullScreen
      scrolling={scrolling}
      referrerPolicy="origin" // The sent referrer will be limited to the origin of the referring page: its scheme, host, and port.
      className={classNames(
        'border border-0',
      )}
      {...props}
    />
  );
}

PluginIframe.propTypes = {
  plugin: PropTypes.shape({
    url: PropTypes.string.isRequired,
    type: PropTypes.oneOf([SCRIPT_PLUGIN, IFRAME_PLUGIN, LTI_PLUGIN]).isRequired,
    props: PropTypes.object,
  }),
  fallback: PropTypes.node,
  scrolling: PropTypes.oneOf(['auto', 'yes', 'no']),
  title: PropTypes.string,
  className: PropTypes.string,
};

PluginIframe.defaultProps = {
  plugin: null,
  fallback: null,
  scrolling: 'auto',
  title: null,
  className: null,
};
