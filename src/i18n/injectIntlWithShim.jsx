import React from 'react';
import { injectIntl, intlShape } from 'react-intl';
import { getLoggingService } from './lib';

/**
 * This function wraps react-intl's injectIntl function in order to add error logging to the intl
 * property's formatMessage function.
 *
 * @memberof I18n
 */
const injectIntlWithShim = (WrappedComponent) => {
  class ShimmedIntlComponent extends React.Component {
    static propTypes = {
      intl: intlShape.isRequired,
    };

    constructor(props) {
      super(props);
      this.shimmedIntl = Object.create(this.props.intl, {
        formatMessage: {
          value: (definition, ...args) => {
            if (definition === undefined || definition.id === undefined) {
              const error = new Error('i18n error: An undefined message was supplied to intl.formatMessage.');
              if (process.env.NODE_ENV !== 'production') {
                console.error(error); // eslint-disable-line no-console
                return '!!! Missing message supplied to intl.formatMessage !!!';
              }
              getLoggingService().logError(error);
              return ''; // Fail silently in production
            }
            return this.props.intl.formatMessage(definition, ...args);
          },
        },
      });
    }

    render() {
      return <WrappedComponent {...this.props} intl={this.shimmedIntl} />;
    }
  }

  return injectIntl(ShimmedIntlComponent);
};


export default injectIntlWithShim;
