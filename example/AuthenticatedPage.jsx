import React, { useContext } from 'react';
import { Link } from 'react-router-dom';

/* eslint-disable import/no-extraneous-dependencies */
import { AppContext } from '@edx/frontend-platform/react';
/* eslint-enable import/no-extraneous-dependencies */

export default function AuthenticatedPage() {
  const { authenticatedUser, config } = useContext(AppContext);

  return (
    <div>
      <h1>{config.SITE_NAME} authenticated page.</h1>
      <p>Hi there, {authenticatedUser.username}.</p>
      <p>Visit <Link to="/">public page</Link>.</p>
    </div>
  );
}
