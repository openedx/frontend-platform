import {
  lazy, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState,
} from 'react';
import { loadPluginComponent, unloadDynamicScript } from './utils';
import { getConfig } from '../../config';
import { PLUGIN_MOUNTED, PLUGIN_READY, PLUGIN_UNMOUNTED } from './constants';

export function useDynamicPluginComponent(plugin) {
  // When this component unmounts, see if we should unload the script that provided it.
  // Note that this is not guaranteed to unload the script if other consumers are still using one
  // of its exports.
  useEffect(() => () => {
    unloadDynamicScript(plugin.url);
  }, []);

  return lazy(loadPluginComponent(plugin));
}

export function usePluginSlot(id) {
  if (getConfig().plugins[id] !== undefined) {
    return getConfig().plugins[id];
  }
  return { keepDefault: true, plugins: [] };
}

export function useMessageEvent(srcWindow, type, callback) {
  useLayoutEffect(() => {
    const listener = (event) => {
      // Filter messages to those from our source window.
      if (event.source === srcWindow) {
        if (event.data.type === type) {
          callback({ type, payload: event.data.payload });
        }
      }
    };
    if (srcWindow !== null) {
      global.addEventListener('message', listener);
    }
    return () => {
      global.removeEventListener('message', listener);
    };
  }, [srcWindow, type, callback]);
}

export function useHostEvent(type, callback) {
  useMessageEvent(global.parent, type, callback);
}

export function usePluginEvent(iframeElement, type, callback) {
  const contentWindow = iframeElement ? iframeElement.contentWindow : null;
  useMessageEvent(contentWindow, type, callback);
}

export function dispatchMessageEvent(targetWindow, message, targetOrigin) {
  targetWindow.postMessage(message, targetOrigin);
}

export function dispatchPluginEvent(iframeElement, message, targetOrigin) {
  dispatchMessageEvent(iframeElement.contentWindow, message, targetOrigin);
}

export function dispatchHostEvent(message) {
  dispatchMessageEvent(global.parent, message, global.document.referrer);
}

export function dispatchReadyEvent() {
  dispatchHostEvent({ type: PLUGIN_READY });
}

export function dispatchMountedEvent() {
  dispatchHostEvent({ type: PLUGIN_MOUNTED });
}

export function dispatchUnmountedEvent() {
  dispatchHostEvent({ type: PLUGIN_UNMOUNTED });
}

export function useElementSize() {
  const observerRef = useRef();

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const [element, setElement] = useState(null);

  const measuredRef = useCallback(_element => {
    setElement(_element);
  });

  useEffect(() => {
    observerRef.current = new ResizeObserver(() => {
      if (element) {
        setDimensions({
          width: element.clientWidth,
          height: element.clientHeight,
        });
        setOffset({
          x: element.offsetLeft,
          y: element.offsetTop,
        });
      }
    });
    if (element) {
      observerRef.current.observe(element);
    }
  }, [element]);

  return useMemo(
    () => ([measuredRef, element, dimensions.width, dimensions.height, offset.x, offset.y]),
    [measuredRef, element, dimensions, offset],
  );
}
