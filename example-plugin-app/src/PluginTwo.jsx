import React from 'react';
import { Plugin } from '@edx/frontend-platform/plugins';

export default function PluginTwo() {
  return (
    <Plugin className="bg-light" ready>
      <section className="bg-light p-3">
        <h2>Homework Due</h2>
        <p>
          Your homework is due, and the professor is going to be on vacation for the next week but
          a TA you haven&apos;t met will be grading your assignments. Good luck!
        </p>
      </section>
    </Plugin>
  );
}
