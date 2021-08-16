# Frontend extensibility and composability

# frontend-platform/plugins

Directory of plugin utilities for loading dynamic plugins

# module.config.js

This is all module.config.js!  The plugin configuration is a new section in that.  The module federation configuration is yet another new section in there.

module.exports = {
  localModules: [
    // { moduleName: '@edx/frontend-platform', dir: '../frontend-platform', dist: 'dist' },
  ],
  remoteModules: [
    { name: 'account', url: 'http://localhost:1997/modules.js' }
  ],
  exposedModules: [

  ],
  plugins: [
    {
      slot: 'user-menu',
      type: 'component',
      url: 'http://localhost:2003/modules.js',
      scope: 'plugin',
      module: 'UserMenu',
      config: {
        username: 'djoy'
      }
    }
  ]
};



## Plugin configuration document

Created on a per-MFE basis.

plugin.config.js

{

}

## Module federation configuration



This is different than a plugin configuration, as the MFE's webpack configuration will dictateas it is merely environment-specific

Default plugins can be included in the MFE itself and loaded dynamically.  This will set up the proper chunks for efficient loading.

Plugin overrides can be structured however is appropriate for the environment.  edx.org may have a frontend-plugins-edx.org deployment with edx.org-specific overrides of defaults

# frontend-plugins-openedx

Default set of frontend plugins which may or may not be used by a given environment depending on its configuration.  Contains a set of generally useful functionality. Calculator would live here.

# frontend-lib-headers

Header-specific organisms would live here, like the user menu.  This is intended to be loaded at build-time by consuming applications and plugins.


Version the modules.js file for shared dependencies like Paragon and Vendor with a major version number.  This means we can manage breaking changes by publishing a new version of the file, and so long as we don't delete the old one, both can co-exist because all the dependent files are versioned.

So do: modules-v1.js - this isn't a great idea, because it means you can't easily stand up the system again from total failure.  It will lose that history when the old files are deleted.  Fudge.

Shared modules are hard problems.  It should only be done with significant resources that are large and incur overhead through duplication.  It's not worth doing for smaller resources, as every edge we create in the graph between nodes increases complexity significantly.



# Types of cross-deployment sharing

Third party libraries like React

Component library like Paragon

Shared organisms like headers and footers

Plugins

Experiments


Header

Header edx.org

User Menu

Logo

Mobile Menu



<PluginSlot>
  <Header configuration={configuration}> // flexible enough for 80% of cases
</PluginSlot>

<Header> belongs to the MFE, but makes use of header sub-organisms from the frontend-lib-headers library.

The sub-organisms in frontend-lib-headers are configurable and composed into the header.

Two notes:

1. PluginSlots must be able to get their own contents, as we don't know where they will be mounted.  Don't pass it in.
2. PluginSlots must be nestable - a plugin slot can have a plugin slot inside it.
3. The children inside a PluginSlot are the default plugins, or default implementations.  Supplying a plugin config replaces the children and uses that instead.

<PluginSlot id="header">
  <Header>
    <Logo>
    <PluginSlot id="header-links">
      <Links>
    </PluginSlot>
    <PluginSlot id="user-menu">
      <UserMenu>
        <UserMenu.Dashboard />
        <UserMenu.Orders />
        <UserMenu.Profile />
        <UserMenu.Account />
      <UserMenu>
    </PluginSlot>
  </Header>
</PluginSlot>

Example: edx.org would configure the 'user-menu' plugin slot to switch out the user-menu implementation to include enterprise links.


MFEs should build and version themselves on npm/Github like our libraries do.  Then our deployment gunk could just pull down and deploy those named versions.


ModuleFederationPlugin

requiredVersion sets a _range_ to use to check the version.
