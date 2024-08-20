#####################################################################
How to: Integrating with third-party services for logging & analytics
#####################################################################

Context
***********************

Service classes
==========

The ``frontend-platform`` library consists of several modules (e.g., logging, analytics, authentication, etc.) consumed by micro-frontends (MFEs) throughout the Open edX platform. The library has been architected in such a way that enables consumers to override default, base behavior of modules by overriding the default implementations of some module interfaces.

While modules (e.g., ``logging`` and ``analytics``) define base service classes, the ``initialize`` function exposes a mechanism for consumers to override the base service classes during MFE initialization, as needed to extend the library behavior or integrate with other external services.::

  // override default services via ``initialize`` in MFE entrypoints
  initialize({
    loggingService = CustomLoggingService,
    analyticsService = CustomAnalyticsService,
    // ...
  });

  // override default services via private ``env.config``
  const config = {
    loggingService: CustomLoggingService,
    analyticsService: CustomAnalyticsService,
  };
  export default config;

Each module with a service class exposes an interface and subsequently implements a base service class for the defined interface. For example, ``src/logging/interface.js`` defines the following interface:

- ``logInfo``
- ``logError``
- ``setCustomAttribute``

Regarding analytics, ``src/analytics/interface.js`` defines the service as having the following functions:

- ``sendTrackingLogEvent``
- ``identifyAuthenticatedUser``
- ``identifyAnonymousUser``
- ``sendTrackEvent``
- ``sendPageEvent``

When overriding the base service classes (e.g., a custom ``LoggingService`` class), each of the required, defined interface functions must be implemented. The implementation of the interface is currently verified via ``PropTypes.checkPropTypes`` during the configuration/instantiation of the service class.

Other mechanisms to integrate third-party services
==========


``loadExternalScripts``
------------

During MFE initialization, the ``initialize`` function accepts an optional ``externalScripts`` argument, representing a list of external "loader" classes instantiated via ``loadExternalScripts``::

  initialize({
    externalScripts: [GoogleAnalyticsLoader],
    // ...
  })

By default, ``externalScripts`` contains a ``GoogleAnalyticsLoader``, but may be extended to include other loader classes, too.

Open questions:

#. Why isn't ``GoogleAnalyticsLoader`` treated as an overridden ``analyticsService``?
#. Under what cirumstances *should* ``externalScripts`` be used versus overriding/extending the default ``loggingService`` vs. ``analyticsService``?
#. Is it possible to use ``externalScripts`` without modifying ``openedx`` MFE code (e.g., does it require a fork?)
#. Any scripts implemented via ``externalScripts`` will not be called via the service functions implemented throughout MFEs. For instance, what if an Open edX instance wants Google Analytics events for the instrumented ``sendTrackEvent`` usages throughout the platform?

(Proposed) ``useComponentPropOverrides`` & ``withComponentPropOverrides``
------------

Neither of the above approaches to integrate third-party, external services into Open edX MFEs support passing vendor-specific HTML attributes or class names to specific rendered components. For example, to suppress/unsuppress PII from session replays in tools like Datadog/Hotjar, it necessitates passing a custom prop to the component that may not be hardcoded into ``openedx`` repositories (e.g., ``data-dd-privacy`` for Datadog).

A `proposed solution <https://github.com/openedx/frontend-platform/pull/723>`_ to this challenge is the addition of supporting the ability to override props for specific components via private configuration through the use of ``useComponentPropOverrides`` and/or ``withComponentPropOverrides``::

  // example env.config
  const config = {
    componentPropOverrides: {
    targets: {
      example: {
        'data-dd-privacy': 'mask', // Custom `data-*` attribute (e.g., Datadog)
        onClick: (e) => console.log('custom event handler'),
      },
    },
  };
  export default config;

By default, ``useComponentPropOverrides`` and ``withComponentPropOverrides`` supports any custom `className` or `data-*` props. However, specific components may allow other prop types to be overridden applied by supplying the ``allowedPropNames`` and/or ``allowsDataAttributes`` options::

  const ExampleComponentWithDefaultPropOverrides = ({ children, ...rest }) => {
    const propOverrides = useComponentPropOverrides('example', rest);
    return <span {...propOverrides}>{children}</span>;
  });
  
  const ExampleComponentWithAllowedPropOverrides = ({ children, ...rest }) => {
    const propOverrides = useComponentPropOverrides('example', rest, {
      allowedPropNames: ['className', 'style', 'onClick'],
      allowsDataAttributes: true,
    });
    return <span {...propOverrides}>{children}</span>;
  });

Performance considerations
***********************

Performance implications should be considered while integrating with other services.Any third-party, external vendor scripts (e.g., Segment, Google Analytics, Datadog, etc.) loaded via a service class (e.g., ``SegmentAnalyticsService``, ``externalScripts``) are injecting ``<script>`` tags into the HTML document *after* much of the MFE's application code has been downloaded/parsed. That is, all JS needed for frontend-platform's MFE initialization must be downloaded/evaluated first *before* downloading any external scripts.

The default/base ``NewRelicLoggingService`` is currently an exception in that it injects the New Relic JS `<script>` tag during the Webpack build process via ``HtmlWebpackNewRelicPlugin``, whereby the New Relic `<script>` may be downloaded earlier in the initial page load, without being blocked on parsing frontend-platform's JS. In a similar vein, many MFEs integrate with Optimizely by hardcoding its associated ``<script>`` element in the ``public/index.html`` file for the MFE (not open-source friendly).
