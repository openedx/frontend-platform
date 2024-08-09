import {
  forwardRef, useContext, useEffect, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';

import { AppContext, useComponentPropOverrides, withComponentPropOverrides } from '@edx/frontend-platform/react';

// Example via `useComponentPropOverrides` (hook)
const ExampleComponentWithDefaultPropOverrides = forwardRef(({ children, ...rest }, ref) => {
  const propOverrides = useComponentPropOverrides('example', rest);
  return <span ref={ref} {...propOverrides}>{children}</span>;
});
ExampleComponentWithDefaultPropOverrides.displayName = 'ExampleComponentWithDefaultPropOverrides';
ExampleComponentWithDefaultPropOverrides.propTypes = {
  children: PropTypes.node.isRequired,
};

const ExampleComponentWithAllowedPropOverrides = forwardRef(({ children, ...rest }, ref) => {
  const propOverrides = useComponentPropOverrides('example2', rest, {
    allowedPropNames: ['className', 'style', 'onClick'],
  });
  return <span ref={ref} {...propOverrides}>{children}</span>;
});
ExampleComponentWithAllowedPropOverrides.displayName = 'ExampleComponentWithAllowedPropOverrides';
ExampleComponentWithAllowedPropOverrides.propTypes = {
  children: PropTypes.node.isRequired,
};

// Example via `withComponentPropOverrides` (HOC)
const ExampleComponent = forwardRef(({ children, ...rest }, ref) => (
  <span ref={ref} {...rest}>{children}</span>
));
ExampleComponent.displayName = 'ExampleComponent';
ExampleComponent.propTypes = {
  children: PropTypes.node.isRequired,
};
const ExampleComponentWithPropOverrides3 = withComponentPropOverrides('example3')(ExampleComponent);

function jsonStringify(obj) {
  const replacer = (key, value) => {
    if (typeof value === 'function') {
      return '[Function]';
    }
    return value;
  };
  return JSON.stringify(obj, replacer, 2);
}

function useExample() {
  const ref = useRef(null);
  const [node, setNode] = useState(null);

  useEffect(() => {
    if (ref.current) {
      setNode(ref.current.outerHTML);
    }
  }, []);

  return {
    ref,
    node,
  };
}

export default function ComponentPropOverridesPage() {
  const { config } = useContext(AppContext);
  const firstExample = useExample();
  const secondExample = useExample();
  const thirdExample = useExample();

  const { componentPropOverrides } = config;

  return (
    <div>
      <h1>Example usage of <code>componentPropOverrides</code> from configuration</h1>

      <h2>Current configuration</h2>
      {componentPropOverrides ? (
        <pre>
          {jsonStringify({ componentPropOverrides })}
        </pre>
      ) : (
        <p>
          No <code>componentPropOverrides</code> configuration found. Consider updating this
          application&apos;s <code>env.config.js</code> to configure any custom props.
        </p>
      )}

      <h2>Examples</h2>
      <p>
        The following examples below demonstrate
        using <code>useComponentPropOverrides</code> and <code>withComponentPropOverrides</code> to
        extend any component&apos;s base props based on the application&apos;s configuration. Inspect the DOM
        elements for the rendered example components below to observe the configured attributes/values.
      </p>

      {/* Example 1 (useComponentPropOverrides) */}
      <h3><code>useComponentPropOverrides</code> (hook)</h3>
      <h4>Default support prop overrides</h4>
      <p>
        By default, only <code>data-*</code> attributes and <code>className</code> props are
        supported; other props will be ignored. You may opt-in to non-default prop
        overrides by extending the <code>allowedPropNames</code> option.
      </p>
      <p>
        <ExampleComponentWithDefaultPropOverrides
          ref={firstExample.ref}
          // eslint-disable-next-line no-console
          onClick={(e) => console.log('ExampleComponentWithPropOverrides clicked', e)}
          style={{ borderBottom: '4px solid red' }}
          className="example-class"
        >
          Example 1
        </ExampleComponentWithDefaultPropOverrides>
      </p>
      <i>Result:</i>{' '}
      <pre>
        <code>{firstExample.node}</code>
      </pre>

      {/* Example 2 (useComponentPropOverrides) */}
      <h4>Opt-in to specific prop overrides with <code>allowedPropNames</code></h4>
      <p>
        <ExampleComponentWithAllowedPropOverrides
          ref={secondExample.ref}
          // eslint-disable-next-line no-console
          onClick={(e) => console.log('ExampleComponentWithPropOverrides clicked', e)}
          style={{ borderBottom: '4px solid red' }}
          className="example-class"
        >
          Example 2
        </ExampleComponentWithAllowedPropOverrides>
      </p>
      <i>Result:</i>{' '}
      <pre>
        <code>{secondExample.node}</code>
      </pre>

      {/* Example 3 (withComponentPropOverrides) */}
      <h3><code>withComponentPropOverrides</code> (HOC)</h3>
      <p>
        <ExampleComponentWithPropOverrides3 ref={thirdExample.ref}>
          Example 3
        </ExampleComponentWithPropOverrides3>
      </p>
      <i>Result:</i>{' '}
      <pre>
        <code>{thirdExample.node}</code>
      </pre>
    </div>
  );
}
