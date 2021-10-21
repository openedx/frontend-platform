import React from 'react';
import { PluginSlot } from '@edx/frontend-platform/plugins';

export default function PluginsPage() {
  return (
    <main>
      <h1>Plugins Page</h1>

      <p>
        This page is here to help test the plugins module.  A plugin configuration can be added in
        index.jsx and this page will display that plugin.
      </p>
      <p>
        To do this, a plugin MFE must be running on some other port (this test server is probably
        running on 8080).  To make it a more realistic test, you may also want to edit your
        /etc/hosts file (or your system&apos;s equivalent) to provide an alternate domain for
        127.0.0.1 at which you can load the plugin.  For instance, an entry of
        &quot;127.0.0.1 edx-test-plugin.com&quot; and a test server port of 8081 would let you use
        a plugin configuration like the one commented out above in PluginsPage.jsx.
      </p>
      <div className="d-flex flex-column">
        <PluginSlot id="example" className="d-flex flex-column">
          <div key="default">This is default plugin content.</div>
        </PluginSlot>
      </div>
    </main>
  );
}
