import React from 'react';
import { mount } from 'enzyme';

import ErrorBoundary from './ErrorBoundary';

import { logError } from '../logging';
import { IntlProvider } from '../i18n';

jest.mock('../logging');

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // This is a gross hack to suppress error logs in the invalid parentSelector test
    jest.spyOn(console, 'error');
    global.console.error.mockImplementation(() => {});
  });

  afterEach(() => {
    global.console.error.mockRestore();
  });

  it('should render children if no error', () => {
    const component = (
      <ErrorBoundary>
        <div>Yay</div>
      </ErrorBoundary>
    );
    const wrapper = mount(component);

    const element = wrapper.find('div');
    expect(element.text()).toEqual('Yay');
  });

  it('should render ErrorPage if it has an error', () => {
    const ExplodingComponent = () => {
      throw new Error('booyah');
    };

    const component = (
      <IntlProvider locale="en" messages={{}}>
        <ErrorBoundary>
          <ExplodingComponent />
        </ErrorBoundary>
      </IntlProvider>
    );
    mount(component);

    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenCalledWith(new Error('booyah'), { stack: '\n    in ExplodingComponent\n    in ErrorBoundary\n    in IntlProvider (created by WrapperComponent)\n    in WrapperComponent' });
  });
});
