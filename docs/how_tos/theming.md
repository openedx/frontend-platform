# Theming support with `@edx/paragon` and `@edx/brand`

## Overview

This document serves as a guide to using `@edx/frontend-platform` to support MFE theming with Paragon using theme CSS loaded externally (e.g., from a CDN).

To do this, configured URLs pointing to relevant CSS files from `@edx/paragon` and (optionally) `@edx/brand` are loaded and injected to the HTML document at runtime. This differs than the consuming application importing the styles from `@edx/paragon` and `@edx/brand` directly, which includes these styles in the application's production assets.

By serving CSS loaded externally, consuming applications of Paragon no longer need to be responsible for compiling the theme SCSS to CSS themselves and instead use a pre-compiled CSS file. In doing so, this allows making changes to the Paragon theme without needing to necessarily re-build and re-deploy all consuming applications.

### Dark mode and theme variant preferences

`@edx/frontend-platform` supports both `light` (required) and `dark` (optional) theme variants. The choice of which theme variant should be applied on page load is based on the following preference cascade:

1. **Get theme preference from localStorage.** Supports persisting and loading the user's preference for their selected theme variant, until cleared.
1. **Detect user system settings.** Rely on the `prefers-color-scheme` media query to detect if the user's system indicates a preference for dark mode. If so, use the default dark theme variant, if one is configured.
1. **Use default theme variant as configured (see below).** Otherwise, load the default theme variant as configured by the `defaults` option described below.

Whenever the current theme variant changes, an attrivbute `data-paragon-theme-variant="*"` is updated on the `<html>` element. This attribute enables applications' both JS and CSS to have knowledge of the currently applied theme variant.

### Supporting custom theme variants beyond `light` and `dark`

If your use case necessitates additional variants beyond the default supported `light` and `dark` theme variants, you may pass any number of custom theme variants. Custom theme variants will work the user's persisted localStorage setting (i.e., if a user switches to a custom theme variant, the MFE will continue to load the custom theme variant by default). By supporting custom theme variants, it also supports having multiple or alternative `light` and/or `dark` theme variants.

### Performance implications

There is also a meaningful improvement in performance as loading the compiled theme CSS from an external CDN means micro-frontends (MFEs) can include cached styles instead of needing to load essentially duplicate theme styles included in each individual MFE as users navigate across the platform.

However, as the styles from `@edx/paragon` and `@edx/brand` get loaded at runtime by `@edx/frontend-platform`, the associated CSS files do not get processed through the consuming application's Webpack build process (e.g., if the MFE used PurgeCSS or any custom PostCSS plugins specifically for Paragon).

### Falling back to styles installed in consuming application

If any of the configured external `PARAGON_THEME_URLS` fail to load for whatever reason (e.g., CDN is down, URL is incorrectly configured), `@edx/paragon` will attempt to fallback to the relevant files installed in `node_modules` from the consuming application.

## Technical architecture

![overview of paragon theme loader](./assets/paragon-theme-loader.png "Paragon theme loader")

## Development

### Basic theme URL configuration

Paragon supports 2 mechanisms for configuring the Paragon theme urls:
* JavaScript-based configuration via `env.config.js`
* MFE runtime configuration API via `edx-platform`

Using either configuration mechanism, a `PARAGON_THEME_URLS` configuration setting must be created to point to the externally hosted Paragon theme CSS files, e.g.:

```json
{
    "core": {
        "url": "https://cdn.jsdelivr.net/npm/@edx/paragon@$paragonVersion/dist/core.min.css"
    },
    "defaults": {
        "light": "light",
    },
    "variants": {
        "light": {
            "url": "https://cdn.jsdelivr.net/npm/@edx/paragon@$paragonVersion/dist/light.min.css",
        }
    }
}
```

### Configuration options

The `PARAGON_THEME_URLS` configuration object supports using only the default styles from `@edx/paragon` or, optionally, extended/overridden styles via `@edx/brand`. To utilize `@edx/brand` overrides, see the `core.urls` and `variants.*.urls` options below.

The `dark` theme variant options are optional.

| Property                              | Data Type     | Description                                                                                       |
| --------                              | -----------   | -----------                                                                                       |
| `core`                                | Object        | Metadata about the core styles from `@edx/paragon` and `@edx/brand`.                              |
| `core.url`                            | String        | URL for the `core.css` file from `@edx/paragon`.                                                  |
| `core.urls`                           | Object        | URL(s) for the `core.css` files from `@edx/paragon` CSS and (optionally) `@edx/brand`.            |
| `core.urls.default`                   | String        | URL for the `core.css` file from `@edx/paragon`.                                                  |
| `core.urls.brandOverride`             | Object        | URL for the `core.css` file from `@edx/brand`.                                                    |
| `defaults`                            | Object        | Mapping of theme variants to Paragon's default supported light and dark theme variants.           |
| `defaults.light`                      | String        | Default `light` theme variant from the theme variants in the `variants` object.                   |
| `defaults.dark`                       | String        | Default `dark` theme variant from the theme variants in the `variants` object.                    |
| `variants`                            | Object        | Metadata about each supported theme variant.                                                      |
| `variants.light`                      | Object        | Metadata about the light theme variant styles from `@edx/paragon` and (optionally)`@edx/brand`.   |
| `variants.light.url`                  | String        | URL for the `light.css` file from `@edx/paragon`.                                                 |
| `variants.light.urls`                 | Object        | URL(s) for the `light.css` files from `@edx/paragon` CSS and (optionally) `@edx/brand`.           |
| `variants.light.urls.default`         | String        | URL for the `light.css` file from `@edx/paragon`.                                                 |
| `variants.light.urls.brandOverride`   | String        | URL for the `light.css` file from `@edx/brand`.                                                   |
| `variants.dark`                       | Object        | Metadata about the dark theme variant styles from `@edx/paragon` and (optionally)`@edx/brand`.    |
| `variants.dark.url`                   | String        | URL for the `dark.css` file from `@edx/paragon`.                                                  |
| `variants.dark.urls`                  | Object        | URL(s) for the `dark.css` files from `@edx/paragon` CSS and (optionally) `@edx/brand`.            |
| `variants.dark.urls.default`          | String        | URL for the `dark.css` file from `@edx/paragon`.                                                  |
| `variants.dark.urls.brandOverride`    | String        | URL for the `dark.css` file from `@edx/brand`.                                                    |

### JavaScript-based configuration

One approach to configuring the `PARAGON_THEME_URLS` is to create a `env.config.js` file in the root of the repository. The configuration is defined as a JavaScript file, which affords consumers to use more complex data types, amongst other benefits.

To use this JavaScript-based configuration approach, you may set a `PARAGON_THEME_URLS` configuration variable in a `env.config.js` file:

```js
const config = {
    PARAGON_THEME_URLS: {
        core: {
            url: 'https://cdn.jsdelivr.net/npm/@edx/paragon@$paragonVersion/dist/core.min.css',
        },
        defaults: {
            light: 'light',
        },
        variants: {
            light: {
                url: 'https://cdn.jsdelivr.net/npm/@edx/paragon@$paragonVersion/dist/light.min.css',
            },
        },
    },
};

export default config;
```

### MFE runtime configuration API

`@edx/frontend-platform` additionally supports loading application configuration from the MFE runtime configuration API via `edx-platform`. The configuration is served by the `http://localhost:18000/api/mfe_config/v1` API endpoint. For more information, refer to [this documentation](https://github.com/openedx/edx-platform/blob/master/lms/djangoapps/mfe_config_api/docs/decisions/0001-mfe-config-api.rst) about the MFE runtime configuration API, please see these docs.

The application configuration may be setup via Django settings as follows:

```python
ENABLE_MFE_CONFIG_API = True
MFE_CONFIG = {}
MFE_CONFIG_OVERRIDES = {
    # The below key represented the `APP_ID` defined in your MFE
    'profile': {
        'PARAGON_THEME_URLS': {
            'core': {
                'url': 'https://cdn.jsdelivr.net/npm/@edx/paragon@$paragonVersion/dist/core.min.css',
            },
            'defaults': {
                'light': 'light',
            },
            'variants': {
                'light': {
                    'url': 'https://cdn.jsdelivr.net/npm/@edx/paragon@$paragonVersion/dist/light.min.css',
                },
            },
        },
    },
}
```

### Locally installed `@edx/paragon`

If you would like to use the same version of the Paragon CSS urls as the locally installed `@edx/paragon`, the configuration for the Paragon CSS urls may contain a wildcard `$paragonVersion` which gets replaced with the locally installed version of `@edx/paragon` in the consuming application, e.g.:

```shell
https://cdn.jsdelivr.net/npm/@edx/paragon@$paragonVersion/dist/core.min.css
https://cdn.jsdelivr.net/npm/@edx/paragon@$paragonVersion/dist/light.min.css
```

In the event the other Paragon CSS urls are configured via one of the other documented mechanisms, but they fail to load (e.g., the CDN url throws a 404), `@edx/frontend-platform` will attempt to fallback to injecting the locally installed Paragon CSS from the consuming application into the HTML document.

## Usage with `@edx/brand`

The core Paragon design tokens and styles may be optionally overriden by utilizing `@edx/brand`, which allows theme authors to customize the default Paragon theme to match the look and feel of their custom brand.

This override mechanism works by compiling the design tokens defined in `@edx/brand` with the the core Paragon tokens to generate overrides to Paragon's default CSS variables, and then compiling the output CSS with any SCSS theme customizations not possible through a design token override.

The CSS urls for `@edx/brand` overrides will be applied after the core Paragon theme urls load, thus overriding any previously set CSS variables and/or styles.

To enable `@edx/brand` overrides, the `PARAGON_THEME_URLS` setting may be configured as following:

```js
const config = {
    PARAGON_THEME_URLS: {
        core: {
            urls: {
                default: 'https://cdn.jsdelivr.net/npm/@edx/paragon@$paragonVersion/dist/core.min.css',
                brandOverride: 'https://cdn.jsdelivr.net/npm/@edx/brand-edx.org@#brandVersion/dist/core.min.css',
            },
        },
        defaults: {
            light: 'light',
        },
        variants: {
            light: {
                urls: {
                    default: 'https://cdn.jsdelivr.net/npm/@edx/paragon@$paragonVersion/dist/light.min.css',
                    brandOverride: 'https://cdn.jsdelivr.net/npm/@edx/brand-edx.org@$brandVersion/dist/light.min.css',
                },
            },
        },
    },
};

export default config;
```

### Locally installed `@edx/brand`

If you would like to use the same version of the brand override CSS urls as the locally installed `@edx/brand`, the configuration for the brand override CSS urls may contain a wildcard `$brandVersion` which gets replaced with the locally installed version of `@edx/brand` in the consuming application, e.g.:

```shell
https://cdn.jsdelivr.net/npm/@edx/brand@$brandVersion/dist/core.min.css
https://cdn.jsdelivr.net/npm/@edx/brand@$brandVersion/dist/light.min.css
```

In the event the other brand override CSS urls are configured via one of the other documented mechanisms, but they fail to load (e.g., the CDN is down), `@edx/frontend-platform` will attempt to fallback to injecting the locally installed brand override CSS urls from the consuming application into the HTML document.
