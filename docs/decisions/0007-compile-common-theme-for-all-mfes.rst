0007 Compile Common Theme for all MFEs
######################################


Status
******

Draft

Context
*******

Currently each Open edX MFE includes a small snippet of SCSS code that is common
to all of them, which is the following four lines:

.. code-block:: SCSS

	@import "~@edx/brand/paragon/fonts";
	@import "~@edx/brand/paragon/variables";
	@import "~@edx/paragon/scss/core/core";
	@import "~@edx/brand/paragon/overrides";

These four lines, import the Paragon and bootstrap code and apply
branding-specific overrides on top. They contain the bulk of the SCSS code
generated for MFEs. Following this are usually imports for the frontend header
and footer components, imports from the MFE own components and MFE-specific
SCSS.

This effectively means that all MFEs share a large chunk of common styling code
with a comparatively much smaller set of styles applied over that.

There is scope here to properly split the MFE stylesheet into multiple parts,
one being the common code as represented by the above imports, and another for
MFE-specific code, and build them separately.

One thing that prevents this is that MFEs need these SCSS imports to get
variables. In a number of cases these can be replaced with either
Paragon/Bootstrap classes, or CSS variables. A separate ADR in `Paragon
<https://github.com/openedx/paragon/pull/1388>`_ covers the situations where
this isn't possible yet.

Decision
********

Common cores styling that is to be applied to all MFEs should be part of a
separate stylesheet and built separately from the MFE-specific stylesheet.

Both these stylesheets will be included in each MFE, however the common
stylesheet can be loaded from a common source for all MFEs. This will allow for
deploying the common theme stylesheet without redeploying MFEs.

The mechanism for loading this common stylesheet will need to be different from
the mechanism for loading the MFE stylesheet. A JavaScript theme loader will
contain the location of the SCSS file and will add this stylesheet to the
document.

The common theme package will be similar to the branding package, but can be
deployed independently of MFEs. It will produce a CSS stylesheet, and a
JavaScript loader that will load this stylesheet. When deploying MFEs, they can
be provided a configuration variable that contains the location where this
theme loader is deployed.

The frontend-platform repo can host code that simplifies using themes. It can
check if a theme loader is configured, and if so, dynamically load the theme
from there. Otherwise, it can continue using the existing mechanism of building
and deploying the theme for each MFE for backwards-compatibility. It can also
provide hooks for loading the theme and potentially/eventually also selecting
a theme.

Consequences
************

With a single common stylesheet for all MFE, they should load quicker since the
stylesheet can be cached once for all MFEs. It also makes theme rebuilds much
quicker, and eliminates the need for rebuilding each MFE for minor change to
the theme.

For context, on a sample development machine, rebuilding an MFE takes roughly
one minute, of this, on the same machine, around 3-4 seconds is the time it
takes to build the theme.

By continuing to support the existing theming mechanism, the current mechanism
for theming can continue working for those who need it.

Since there is a JavaScript-based loader involved, there is potential for
flashing of unstyled content during loading, however this can be avoided by
making the theme loader part of the init process so it runs before the app is
considered ready.

Another major consequence of this change would be that the CSS code for Paragon
would be loaded using a different mechanism than the JavaScript code of Paragon.
The CSS code would be compiled into the theme whereas the JS code will be loaded
directly. This means that if different versions of Paragon are used for an MFE
vs the common theme, then there is a chance that an incompatible version of the
CSS could be loaded for the MFE. This will make it all the more important to
ensure that version of Paragon used across all MFEs is compatible. This will be
simpler for named releases than for those running latest code changes.

Rejected Alternatives
*********************

- **Loading the common CSS directly instead of with a JavaScript based loader**

  This ADR proposes using an intermediary JavaScript loader to load CSS rather
  then just having the configuration variable point to the stylesheet itself.
  This is done for performance reasons.

  Currently, when an MFE is built, each static asset contains the hash of the
  asset in the file name. The ``index.html`` file includes these generated file
  names, and if any asset changes the ``index.html`` file is updated.

  When a user reloads an MFE page the index page is reloaded, and if any assets
  have changed, their file names will have as well and they will be loaded
  fresh. Unchanged assets will keep using the same name and can load from the
  cache for a very long time.

  If the file names don't change with the content, then there is a risk of
  loading older code from the cache, or (if caching is disabled) of loading a
  huge chunk of code with each refresh and having a huge hit on performance.

  So to maximise the amount of time for which stylesheets are cached, and
  minimise the amount of code that needs to be loaded on each refresh, we need
  to have a light intermediary loader that provides the location of the
  stylesheet. The bulk of the CSS can then be cached for as long as it is
  unchanged.

- **Have the theme loading code in each MFE**

  This doesn't change much about the rest of the mechanism of this ADR, but it
  causes a lot of code duplication across MFEs. Just like ``frontend-platform``
  handles authentication for all MFEs, it can also handle dealing with the theme
  loader.


References
**********

- `ADR to introduce CSS variables to parargon
  <https://github.com/openedx/paragon/pull/1388>`_
