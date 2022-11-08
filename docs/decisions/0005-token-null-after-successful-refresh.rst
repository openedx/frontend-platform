Access Token Null After Successful Refresh
==========================================

Status
------

Accepted

Context
-------

There are cases where our frontend authentication code requests an updated access token (JWT cookies), gets a successful response, but the cookies never appear. This results in the JavaScript error: "[frontend-auth] Access token is still null after successful refresh."

Decision
--------

Since we have been unable to determine root cause, the de facto decision is to allow this issue to continue to exist.

This doc is less about capturing the decision, then to capture the background in-case anyone wishes to understand what has been attempted so far.

Failed Hypotheses
-----------------

Several failed hypotheses have been tested to determine why this is happening:

* Tested if caused by a race condition between getting the response and having the cookies set.

  * See https://github.com/edx-unsupported/frontend-auth/pull/38/files

* Tested if caused by cookies being disabled, by creating/reading a separate cookie.

  * Failure noted in https://openedx.atlassian.net/browse/ARCH-948?focusedCommentId=401201

* Tested if the cookies library has a bug by attempting vanilla javascript.

  * Failure noted in https://openedx.atlassian.net/browse/ARCH-948?focusedCommentId=401201

* Tested if caused by a difference between the browser time and server time, causing the cookie to expire on arrival.

  * Only a small subset of the errors (~0.8%) had a time difference of >5 minutes.

  * See https://github.com/openedx/frontend-platform/pull/207

Additional Data
---------------

Here is a query used in New Relic to find these errors in the Learning MFE::

  SELECT count(*) From JavaScriptError
  WHERE errorMessage = '[frontend-auth] Access token is still null after successful refresh.' AND
    appName = 'prod-frontend-app-learning'
  SINCE 4 days ago FACET userAgentName

Almost all of these errors are seen in Safari (2.9 k), with the rest (166) found in Chrome and Microsoft Edge.

Here is an adjusted query searching for errors with a difference of >5 minutes between the server and browser times::

  SELECT count(*) From JavaScriptError
  WHERE errorMessage = '[frontend-auth] Access token is still null after successful refresh.' AND
    browserDriftSeconds > 60*5
  SINCE 4 days ago FACET userAgentName

There were only 24 of these found in Safari, or ~0.8% of all of these errors found in Safari.

Lastly, at the time this data was captured (2021-08-17), this error type made up ~12% of all errors in Safari, and ~3.3% of all errors across all browsers in the Learning MFE.

* It is unclear if these errors can be duplicated with special privacy settings in Safari (or other browsers).

* We have not learned about this issue from Customer Support, but only from monitoring errors. Since we are not receiving the JWT cookies, we do not know the affected users.
