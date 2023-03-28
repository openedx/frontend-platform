/* eslint-disable import/prefer-default-export */
/**
 * #### Import members from **@edx/frontend-platform/analytics**
 *
 * Contains a shared interface for tracking events.  Has a default implementation of
 * GoogleAnalyticsService.
 *
 * The `initialize` function performs much of the analytics configuration for you.  If, however,
 * you're not using the `initialize` function, analytics can be configured via:
 *
 * ```
 * import { configureGoogleAnalytics, GoogleAnalyticsService } from '@edx/frontend-platform/google-analytics';
 * import { getConfig } from '@edx/frontend-platform';
 *
 * configureGoogleAnalytics(GoogleAnalyticsService, {
 *   config: getConfig(),
 * });
 * ```
 *
 * As shown in this example, analytics depends on the configuration document.
 *
 * @module GoogleAnalytics
 */
import PropTypes from 'prop-types';

const googleOptionsShape = {
  config: PropTypes.object.isRequired,
};

let googleService;

/**
 *
 * @param {class} GoogleAnalyticsService
 * @param {*} options
 * @returns {GoogleAnalyticsService}
 */
export function configure(GoogleAnalyticsService, options) {
  PropTypes.checkPropTypes(googleOptionsShape, options, 'property', 'GoogleAnalytics');
  googleService = new GoogleAnalyticsService(options);
  return googleService;
}

/**
 * @name GoogleAnalyticsService
 * @interface
 * @memberof module:GoogleAnalytics
 */
