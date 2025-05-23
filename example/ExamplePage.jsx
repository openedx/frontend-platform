import { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';

/* eslint-disable import/no-extraneous-dependencies */
import { injectIntl, useIntl } from '@edx/frontend-platform/i18n';
import { logInfo } from '@edx/frontend-platform/logging';
import { AppContext } from '@edx/frontend-platform/react';
import {
  ensureConfig, mergeConfig, getConfig, getExternalLinkUrl,
} from '@edx/frontend-platform';
/* eslint-enable import/no-extraneous-dependencies */
import messages from './messages';

mergeConfig({
  EXAMPLE_VAR: process.env.EXAMPLE_VAR,
});

ensureConfig([
  'EXAMPLE_VAR',
  'JS_FILE_VAR',
], 'ExamplePage');

function AuthenticatedUser() {
  const { authenticatedUser } = useContext(AppContext);
  if (authenticatedUser === null) {
    return null;
  }
  return (
    <div>
      <p>Authenticated Username: <strong>{authenticatedUser.username}</strong></p>
      <p>
        Authenticated user&apos;s name:
        <strong>{authenticatedUser.name}</strong>
        (Only available if user account has been fetched)
      </p>
    </div>
  );
}

function ExamplePage() {
  const intl = useIntl();

  useEffect(() => {
    logInfo('The example page can log info, which means logging is configured correctly.');
  }, []);

  return (
    <div>
      <h1>{getConfig().SITE_NAME} example page.</h1>
      <p>{intl.formatMessage(messages['example.message'])}</p>
      <AuthenticatedUser />
      <p>EXAMPLE_VAR env var came through: <strong>{getConfig().EXAMPLE_VAR}</strong></p>
      <p>JS_FILE_VAR var came through: <strong>{getConfig().JS_FILE_VAR}</strong></p>
      <p>External link to <a href={getExternalLinkUrl('https://github.com/openedx/docs.openedx.org/')}>Open edX docs</a> (customized link).</p>
      <p>External link to <a href={getExternalLinkUrl('https://open-edx-proposals.readthedocs.io/en/latest/')}>Open edX OEPs</a> (non-customized link).</p>
      <p>Visit <Link to="/authenticated">authenticated page</Link>.</p>
      <p>Visit <Link to="/error_example">error page</Link>.</p>
    </div>
  );
}

export default injectIntl(ExamplePage);
