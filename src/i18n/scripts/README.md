# i18n/scripts

This directory contains the `transifex-utils.js` and `intl-imports.js` files which are shared across all micro-frontends.

The package.json of `frontend-platform` includes the following sections:

```
  "bin": {
    "intl-imports.js": "i18n/scripts/intl-imports.js"
    "transifex-utils.js": "i18n/scripts/transifex-utils.js"
  },
```

This config block causes boths scripts to be copied to the following path when `frontend-platform` is installed as a 
dependency of a micro-frontend:

```
/node_modules/.bin/intl-imports.js
/node_modules/.bin/transifex-utils.js
```

All micro-frontends have a `Makefile` with a line that loads the scripts from the above path:

```
intl_imports = ./node_modules/.bin/intl-imports.js
transifex_utils = ./node_modules/.bin/transifex-utils.js
```

So if you delete either of the files or the `scripts` directory, you'll break all micro-frontend builds. Happy coding!
