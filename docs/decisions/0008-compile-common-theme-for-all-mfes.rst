0008 Common Paragon Stylesheet Across all MFES
##############################################


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
with a comparatively much smaller set of styles applied over that. Also each
MFE compiles the entirety of Paragon from scratch despite minimal differences
in the end result.

With the introduction of a new styling mechanism in the `design tokens ADR`_ it
will be possible to build a Paragon theme that contains uses CSS variables that
are loaded from a separate file.

By having multiple CSS files that contain different variables it is possible to
update an existing theme with a change to just the variables file shared by all
MFEs instead of having to rebuild and redeploy all MFEs. It is also possible to
have multiple themes that can be swapped out at runtime, such as a light and
dark theme.

Decision
********

Paragon CSS code can be compiled once and loaded in all MFEs from a URL
provided by environment variables (deprecated), JavaScript config files or via
runtime configuration. The runtime configuration will allow having a single
deployment of an MFE cater to multiple sites by varying the theme loaded for
each site.

There is scope for providing multiple stylesheets that contain variable
definitions. These can correspond to a standard light theme, a dark theme and
potentially other themes.

In order to enable this mechanism there will be changes to the frontend
platform that include a mechanism for checking if a common theme location is
defined. If so, code in the AppProvider function that is used by all MFEs will
load the theme from here automatically.

There will also be an API for runtime loading of a theme, which can allow MFEs
to provide a UI for runtime theme switching.

Consequences
************

Since these stylesheets are shared across all MFEs, they can be uploaded to a
CDN, speeding up loading of all MFEs since a cached stylesheet will be loaded
for all MFEs once a user has used any MFE. Likewise any updates pushed to the
CDN can automatically be pushed to all MFEs automatically. A change in the CDN
URL can also be propagated through runtime configuration without needing to
rebuild all MFEs.

Changes to theming variables can also be deployed much quicker, and since the
themes use CSS variables, the original cached core Paragon stylesheet can
continue to be used while the much smaller variables file will need to be
reloaded.

This will make theme rebuilds much quicker, and eliminate the need for
rebuilding each MFE for minor change to the theme. For context, on a sample
development machine, rebuilding an MFE takes roughly one minute, of this, on
the same machine, around 3-4 seconds is the time it takes to build the theme.

By continuing to support the existing theming mechanism, the current mechanism
for theming can continue working for those who need it. There can be changes
made to frontend-build that will pre-load these themes by injecting them into
the header so they are loaded quicker.

A theme switching UI can also potentially be made part of the header or footer
component to make it available across all MFEs easily.

References
**********

- `Design tokens ADR
  <https://github.com/openedx/paragon/pull/1929>`_
