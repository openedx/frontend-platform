# Theming support with Paragon

This document serves as a guide to using `@edx/frontend-platform` to support MFE theming with Paragon using theme CSS loaded externally (e.g., from a CDN). By serving CSS loaded externally, consuming applications of Paragon no longer need to be responsible for compiling the theme SCSS to CSS themselves and instead use a pre-compiled CSS file. In doing so, this allows making changes to the Paragon theme without needing to necessarily re-build and re-deploy all consuming applications. We would also get a meaningful gain in performance as loading the compiled theme CSS from an external CDN means micro-frontends (MFEs) can include cached styles instead of needing to load essentially duplicate theme styles as users navigate across different MFEs.

## Overview

![overview of paragon theme loader](./assets/paragon-theme-loader.png "Paragon theme loader")

## Theme URL configuration

Paragon supports 2 mechanisms for configuring the Paragon theme URLs:
* JavaScript-based configuration via `env.config.js`.
* MFE runtime configuration API via `edx-platform`

Using either configuration mechanism, a `PARAGON_THEME_URLS` configuration setting must be created to point to the externally hosted Paragon theme CSS files, e.g.:

```js
const config = {
    PARAGON_THEME_URLS = {
        core: 'https://cdn.jsdelivr.net/npm/@edx/paragon@$paragonVersion/dist/core.css',
        variants: {
            light: 'https://cdn.jsdelivr.net/npm/@edx/paragon@$paragonVersion/dist/light.css',
        },
    },
};
export default config;
```

### JavaScript-based configuration

Another approach to configuration with `@edx/frontend-platform` is to create a `env.config.js` file in the root of the repository, similar to the environment variable configuration mentioned above. However, in this case, the configuration is defined as a JavaScript file, which affords consumers to use more complex data types than just strings as in the environment variable approach.

To use this JavaScript-based configuration approach, you may set a `PARAGON_THEME_URLS` configuration variable in your `env.config.js` file:

```js
const config = {
    PARAGON_THEME_URLS: {
        core: 'https://cdn.jsdelivr.net/npm/@edx/paragon@$paragonVersion/dist/paragon.css',
        variants: {
            light: 'https://cdn.jsdelivr.net/npm/@edx/paragon@$paragonVersion/scss/core/css/variables.css',
        },
    },
};
export default config;
```


### MFE runtime configuration API

`@edx/frontend-platform` additionally supports loading application configuration from an API at runtime rather than environment variables. For example, in `edx-platform`, there is an API endpoint for MFE runtime configuration at `http://localhost:18000/api/mfe_config/v1`. The application configuration may be setup via Django settings as follows:

```python
ENABLE_MFE_CONFIG_API = True
MFE_CONFIG = {}
MFE_CONFIG_OVERRIDES = {
    'profile': {
        'PARAGON_THEME_URLS': {
            'core': 'https://cdn.jsdelivr.net/npm/@edx/paragon@$paragonVersion/dist/core.css',
            'variants': {
                'light': 'https://cdn.jsdelivr.net/npm/@edx/paragon@$paragonVersion/dist/light.css',
            },
        },
    },
}
```

### Locally installed `@edx/paragon`

In the event the other Paragon CSS URLs are configured via one of the other documented mechanisms, but they fail to load (e.g., the CDN url throws a 404), `@edx/frontend-platform` will fallback to injecting the locally installed Paragon CSS from the consuming application into the HTML document.

If you would like to use the same version of the Paragon CSS URLs as the locally installed `@edx/paragon`, the configuration for the Paragon CSS URLs may contain a wildcard `$paragonVersion` which gets replaced with the locally installed version of `@edx/paragon` in the consuming application, e.g.:

```shell
https://cdn.jsdelivr.net/npm/@edx/paragon@$paragonVersion/dist/core.css
https://cdn.jsdelivr.net/npm/@edx/paragon@$paragonVersion/scss/core/css/variables.css
```
