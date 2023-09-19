import React from 'react';
import { Plugin } from '@edx/frontend-platform/plugins';

function Greeting({subject}) {
  return <div>Hello {subject.toUpperCase()}</div>
}

export default function PluginOne() {
  return (
    <Plugin className="bg-light">
      <Greeting />
    </Plugin>
  );
}
