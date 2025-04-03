import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@openedx/paragon';
import { getConfig } from '../../config';

function useAlertButtonVariant(props) {
  if (props.variant) {
    // If a variant is explicitly set in the props, use that.
    return props.variant;
  }
  // Otherwise, check for a configured style override for the alert button variant.
  const { styleOverrides } = getConfig();
  if (styleOverrides?.alertButtonVariant) {
    return styleOverrides.alertButtonVariant;
  }

  // If no variant is set in props and no style override is configured, use Paragon's default variant.
  return undefined;
}

/**
 * A default alert button component that utilizes a button variant override, if configured. Otherwise,
 * it defaults to the ``primary`` button variant. By creating this wrapper component, consuming projects
 * can more readily import and use a consistent alert button style across their application without having
 * to re-integrate the button variant logic across every usage.
 * @memberof module:React
 * @param {Object} props
 */
const DefaultAlertButton = forwardRef(({ children, ...props }, ref) => {
  const alertButtonVariant = useAlertButtonVariant(props);
  return (
    <Button
      variant={alertButtonVariant}
      ref={ref}
      {...props}
    >
      {children}
    </Button>
  );
});
DefaultAlertButton.displayName = 'DefaultAlertButton';

DefaultAlertButton.propTypes = {
  children: PropTypes.node.isRequired,
};

export default DefaultAlertButton;
