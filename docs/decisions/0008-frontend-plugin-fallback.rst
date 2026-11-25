How to Handle Frontend iFrame Plugin Fallback 
======================================================================================

Status
------

Draft

Context
-------
The Frontend Plugin Framework's iFrame class implementation will live in Frontend Platform,
but the question of how we want to handle the case where the iFrame fails to render needs to
handled. 

Given that this is a new feature that is being made available to the frontend, we 
can't anticipate all of the ways that the plugin will be used for a given repo, nor do we 
have any intention to limit the scope of how it can be used. Because we don't know all of the use 
cases for the plugin, we also don't know the desired fallback method that is desired for any 
given plugin.

Decision
--------
For the above reasons, we will have failing iFrame plugins return an H1 tag that 
says "There was an error.". By doing so, it is up to the engineer/team that implements the plugin 
to handle the desired fallback however they would like. 

Rejected Alternatives
---------------------

The initial assumption was that we should determine what the fallback would be
if the iFrame plugin render failed. The extent of what this handling could look like 
ranges from taking in a fallback argument to providing the same fallback image no matter
how the plugin was being used. These options limit the possibilities for how the fallback 
-- and the plugin itself -- would present itself by assuming each plugin implementation 
or desired fallback method will be the same for all plugins.  

.. _oepXXXX: https://github.com/openedx/open-edx-proposals/pull/287
.. _frontend_plugin_roadmap: https://github.com/openedx/platform-roadmap/issues/27