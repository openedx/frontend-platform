import React from 'react';
import { PluginContainer } from '@edx/frontend-platform/plugins';

export default function PluginOne() {
  return (
    <PluginContainer className="bg-light" ready>
      <section className="bg-light p-3">
        <h2>Site Maintenance</h2>
        <p>The site will be going down for maintenance soon.</p>
      </section>
    </PluginContainer>
  );
}
