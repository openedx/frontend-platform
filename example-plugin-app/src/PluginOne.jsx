import React, {useState, useEffect} from 'react';
import { Plugin } from '@edx/frontend-platform/plugins';

function Greeting({subject}) {
  return <div>Hello {subject.toUpperCase()}</div>
}

function errorFallback(error) {
  return (
    <div className="text-center">
      <p className="h3 text-muted">
        Oops! An error occurred. Please refresh the screen to try again.
      </p>
      <br/>
      {error.message}
    </div>
  );
}

export default function PluginOne() {
  return (
    <Plugin className="bg-light" errorFallbackProp={errorFallback}>
      <Greeting />
    </Plugin>
  );
}
