import React from 'react';
import { render } from '@testing-library/react';
import { fireEvent } from '@testing-library/dom';
import '@testing-library/jest-dom';

import Plugin from './Plugin';
import {
  COMPONENT_PLUGIN, IFRAME_PLUGIN, PLUGIN_MOUNTED, PLUGIN_READY, PLUGIN_RESIZE,
} from './data/constants';
import { IFRAME_FEATURE_POLICY } from './PluginIframe';

const iframeConfig = {
  url: 'http://localhost/plugin1',
  type: IFRAME_PLUGIN,
};

const componentConfig = {
  url: 'http://localhost/plugin1.js',
  type: COMPONENT_PLUGIN,
};

// Mock ResizeObserver which is unavailable in the context of a test.
global.ResizeObserver = jest.fn(function mockResizeObserver() {
  this.observe = jest.fn();
  this.disconnect = jest.fn();
});

describe('Plugin', () => {
  it('should render nothing with a null plugin configuration', () => {
    const component = (
      <Plugin plugin={null} />
    );

    const { container } = render(component);
    expect(container.firstChild).toBeNull();
  });

  it('should render a PluginIframe when given an iframe config', async () => {
    const title = 'test plugin';
    const component = (
      <Plugin plugin={iframeConfig} title={title} fallback={<div>Fallback</div>} />
    );

    const result = render(component);

    const { container } = result;
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

  it('should render a PluginComponent when given a component config', () => {
    const component = (
      <Plugin plugin={componentConfig} fallback={<div>Fallback</div>} />
    );

    const result = render(component);
  });
});
