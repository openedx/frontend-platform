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

With the introduction of a new styling mechanism in the `design tokens ADR`_ it
will be possible to build a Paragon theme that contains a majority of CSS code
that is independent of branding variables, which are loaded from a separate
variables CSS file.

With that change we can now compile a common cross-MFE Paragon CSS that can be
loaded from a common source for all MFEs, and a separate CSS containng all the
theming variables. There can also be multiple variable definitions for different
themes that correspond to a dark and light theme or potentially other variants.

Decision
********

Paragon CSS code can be compiled once and loaded in all MFEs from a URL provided
by an environment variable or via runtime configuration. The runtime
configuration will allow having a single deployment of an MFE cater to multiple
sites by varying the theme loaded for each site.

The CSS code will be split into two parts, the first is the core stylesheet that
contains foundational code such as layout, typography etc. One or more
additional stylesheets will need to be provided which will include the CSS
variables that define the colours, spacing, font faces, sizes etc.

There is scope for provding multiple stylesheets that contain variable
definitions. These can correspond to a standard light theme, a dark theme and
potentially other themes.

In order to enable this mechanism there will be changes to the frontned platform
that include a mechanism for checking if a common theme location is defined,
whether via an environment variable or in runtime configuration. If so, code in
the AppProvider function that is used by all MFEs will load the theme from here
automatically.

There will also be an API for runtime loading of a theme, which can allow MFEs
to provide a UI for runtime theme switching.

Consequences
************

Since these stylesheets are shared across all MFEs, it can be uploaded to a CDN,
speeding up loading of all MFEs since a cached stylesheet will be loaded for all
MFEs once a user has used any MFE. Likewise any updates pushed to the CDN can
automatically be pushed to all MFEs through runtime configuration without
needing to rebuild all of them. Changes to theming variables can also
automatically reflect across all MFEs since they load from a shared location.

This will also make theme rebuilds much quicker, and eliminate the need for
rebuilding each MFE for minor change to the theme.

For context, on a sample development machine, rebuilding an MFE takes roughly
one minute, of this, on the same machine, around 3-4 seconds is the time it
takes to build the theme.

By continuing to support the existing theming mechanism, the current mechanism
for theming can continue working for those who need it.

A theme switching UI can also potentially be made part of the header or footer
component to make it available across all MFEs easily.

References
**********

- `Design tokens ADR
  <https://github.com/openedx/paragon/pull/1929>`_