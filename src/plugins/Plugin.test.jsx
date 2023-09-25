import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { render } from '@testing-library/react';
import { fireEvent } from '@testing-library/dom';
import '@testing-library/jest-dom';

import PluginContainer from './PluginContainer';
import Plugin from './Plugin';
import {
  IFRAME_PLUGIN, PLUGIN_MOUNTED, PLUGIN_READY, PLUGIN_RESIZE,
} from './data/constants';
import { IFRAME_FEATURE_POLICY } from './PluginContainerIframe';

const iframeConfig = {
  url: 'http://localhost/plugin1',
  type: IFRAME_PLUGIN,
};

// Mock ResizeObserver which is unavailable in the context of a test.
global.ResizeObserver = jest.fn(function mockResizeObserver() {
  this.observe = jest.fn();
  this.disconnect = jest.fn();
});

describe('PluginContainer', () => {
  it('should return a blank page with a null plugin configuration', () => {
    // the URL will be empty and an empty div tag will exist where the iFrame should be
    // the iFrame will still take up the space assigned by the host MFE
    const component = (
      <PluginContainer config={null} />
    );

    const { container } = render(component);
    expect(container.firstChild).toBeNull();
  });

  it('should render the desired fallback when the iframe fails to render', () => {

  });

  it('should render a PluginIFrame when given an iFrame config', async () => {
    const title = 'test plugin';
    const component = (
      <PluginContainer config={iframeConfig} title={title} fallback={<div>Fallback</div>} />
    );

    const { container } = render(component);

    const iframeElement = await container.querySelector('iframe');
    const fallbackElement = container.querySelector('div');

    expect(iframeElement).toBeInTheDocument();
    expect(fallbackElement).toBeInTheDocument();

    expect(fallbackElement.innerHTML).toEqual('Fallback');

    // Ensure the iframe has the proper attributes
    expect(iframeElement.attributes.getNamedItem('allow').value).toEqual(IFRAME_FEATURE_POLICY);
    expect(iframeElement.attributes.getNamedItem('src').value).toEqual(iframeConfig.url);
    expect(iframeElement.attributes.getNamedItem('scrolling').value).toEqual('auto');
    expect(iframeElement.attributes.getNamedItem('title').value).toEqual(title);
    // The component isn't ready, since the class has 'd-none'
    expect(iframeElement.attributes.getNamedItem('class').value).toEqual('border border-0 d-none');

    jest.spyOn(iframeElement.contentWindow, 'postMessage');

    expect(iframeElement.contentWindow.postMessage).not.toHaveBeenCalled();

    // Dispatch a 'mounted' event manually.
    const mountedEvent = new Event('message');
    mountedEvent.data = {
      type: PLUGIN_MOUNTED,
    };
    mountedEvent.source = iframeElement.contentWindow;
    fireEvent(window, mountedEvent);

    expect(iframeElement.contentWindow.postMessage).toHaveBeenCalledWith(
      {
        type: PLUGIN_RESIZE,
        payload: {
          width: 0, // There's no width/height here in jsdom-land.
          height: 0,
        },
      },
      'http://localhost/plugin1',
    );

    // Dispatch a 'ready' event manually.
    const readyEvent = new Event('message');
    readyEvent.data = {
      type: PLUGIN_READY,
    };
    readyEvent.source = iframeElement.contentWindow;
    fireEvent(window, readyEvent);

    expect(iframeElement.attributes.getNamedItem('class').value).toEqual('border border-0');
  });
});

describe('Plugin', () => {
  const breakingArray = null;
  const failingMap = () => breakingArray.map(a => a);
  it('should render the desired fallback when the error boundary receives a React error', () => {
    const component = (
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <Plugin className="bg-light" ready>
          { failingMap }
        </Plugin>
      </ErrorBoundary>
    );

    const { container } = render(component);
    expect(container.firstChild).toHaveTextContent('Something went wrong');
  });
});
