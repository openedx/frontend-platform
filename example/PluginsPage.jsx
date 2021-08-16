import React from 'react';
import { Plugin, IFRAME_PLUGIN } from '@edx/frontend-platform/plugins';

export default function PluginsPage() {
  const plugin = {
    url: 'http://localhost:8080/plugin1.html',
    type: IFRAME_PLUGIN,
  };

  return (
    <main>
      <h1>Plugins Page</h1>

      <div className="d-flex">
        <Plugin plugin={plugin} className="border flex-grow-1" />
      </div>
    </main>
  );
}
