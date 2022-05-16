# i18n/scripts

This directory contains the `transifex-utils.js` file which is shared across all micro-frontends.

The package.json of `frontend-platform` includes the following section:

```
  "bin": {
    "transifex-utils.js": "i18n/scripts/transifex-utils.js"
  },
```

This config block causes `transifex-utils.js` to be copied to the following path when `frontend-platform` is installed as a dependency of an micro-frontend:

```
/node_modules/.bin/transifex-utils.js
```

All micro-frontends have a `Makefile` with a line that loads `transifex-utils.js` from the above path:

```
transifex_utils = ./node_modules/.bin/transifex-utils.js
```

So if you delete `transifex-utils.js` or the `scripts` directory, you'll break all micro-frontend builds.  Happy coding!
