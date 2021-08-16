// These are intended to represent three different plugin types.  They're not fully used yet.

// Different plugins of different types would have different loading functionality.
export const COMPONENT_PLUGIN = 'COMPONENT_PLUGIN'; // loads JS script then loads react component from its exports
export const SCRIPT_PLUGIN = 'SCRIPT_PLUGIN'; // loads JS script
export const IFRAME_PLUGIN = 'IFRAME_PLUGIN'; // loads iframe at the URL, rather than loading a JS file.
export const LTI_PLUGIN = 'LTI_PLUGIN'; // loads LTI iframe at the URL, rather than loading a JS file.
