Axios Caching Layer Implementation
=================================================

Status
------

Accepted

Context
-------

It was noticed that on a lot of pages the same API calls are repeatedly being made as the user navigates around the website. The data being returned from these requests doesn't change between page loads leading to the same endpoints reloading the same data repeatedly. We decided that we wanted to avoid repeatedly loading unchanged data and reuse the data that was in the response from the initial load.

We think it's beneficial to cut as much overhead as possible so each page becomes interactive more quickly.

We decided to add a frontend caching layer to the AxiosJwtAuthService by leveraging an already existing npm package: `axios-cache-adapter <https://www.npmjs.com/package/axios-cache-adapter>`_

Having a frontend caching layer would also allow for a stale version of a page to be displayed for a short amount of time in the case of a backend outage.

When Frontend Caching Should Be Used
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The frontend cache should be used to eliminate the reloading of unchanged data as a user navigates between different pages in the application. It shouldn't be used to reduce the number of times multiple components on the same page try to make the same network call. Reducing the number of times the same network call is made on a single page should be done by moving the call higher up in the hierarchy so the call only gets made once and all lower level components are able to access the response data from it.

Requests that are good candidates to use frontend caching are ones that:
 * The data being returned changes very infrequently, and independently from the actions of the user on the page

   - For example changes made by a background job or an admin

 * The data being returned isn't specific to the authenticated user

 * The data returned is specific to the authenticated user but front end does not make the request when there isn't an authenticated user

It should not be used as the only caching strategy that gets used. It is preferable to use a serverside caching strategy in conjunction with frontend caching.

How To Use Frontend Caching
~~~~~~~~~~~~~~~~~~~~~~~~~~~

The frontend caching layer can be used by passing {useCache: true} into the function that gets the httpClient.

e.g.
    service.getAuthenticatedHttpClient({ useCache: true });

By default the response for a GET request will be stored in IndexedDB for 5 minutes and that cached value will get invalidated on any POST, PUT, PATCH, or DELETE request made to the same url. The caching layer also works with the standard cache-control headers: max-age, no-cache, and no-store

Each request can also override the default cache configurations. `The How To document about caching <https://github.com/openedx/frontend-platform/blob/master/docs/how_tos/caching.rst>`_ has more detailed examples about how this caching layer can be used.


Implementation Details
~~~~~~~~~~~~~~~~~~~~~~

For both versions of the current AxiosJwtAuthService HTTP clients, the authenticated client and the base unauthenticated clients, there are now two additional versions that use the cache (i.e. CachedAuthenticated and CachedUnauthenticated). Bringing the total number of httpClient instances up to four.
In order to keep the interface more simple the cached clients don’t have their own getter functions exposing this detail, in order to use the cached http client micro frontends pass in a param for using the cache with the current getter functions.

In the case of the cached clients failing to get created the uncached clients will be returned and used instead.

The async hydrateAuthenticatedUser function will continue only ever using the uncached authenticated HTTP client so there won't be any concerns about the cache changing expected behavior of authentication.

Only the AxiosJwtAuthService currently has cached http clients.

Decisions
---------

By using the existing axios-cache-adapter we were able to avoid needing to implement our own caching strategy and forgo having micro frontends need to implement their own front end caching strategies.

The default max-age for cached data was decided to be 5 minutes for now. 5 minutes was deemed to be a reasonable amount of time that was neither too long or too short. The assumption is made that users won’t be switching to different accounts on their browser frequently enough to have a wide impact on their experience.
If they experience any impact at all then they will only see cached data for a maximum of 5 minutes. Micro frontends are also able to override the default cache time to suit their own needs.
The default max-age can also be changed at a later time if the current default of 5 minutes is deemed to be inadequate.

"Integration tests were added to ensure that the cache adapter does not break the current behavior of the existing interceptors. These tests make real HTTP requests to https://httpbin.org/ as suggested by the tests in the axios-cache-adapter source code."

Alternatives
------------

We discussed the pros and cons of having a frontend-platform cache implementation for micro front ends to use versus micro front ends implementing their own front end caching strategies utilizing Local/Session storage, ETags, and endpoints utilizing Cache-Control headers.
Having a frontend-platform caching solution be widely available to micro frontends was decided to be a good thing and micro frontends are still able to use other caching strategies in conjunction with the caching in frontend-platform.

Adoption
--------

As of this writing, only a few HTTP requests within `frontend-app-learner-portal-enterprise <http://github.com/openedx/frontend-app-learner-portal-enterprise>`_ have adopted using the cached clients. Usage of the cache clients is on an opt-in basis where micro frontends determine whether or not using the front end cache clients suits their needs.


Consequences
------------

Axios is version locked to version 0.18.1 so per request overrides work until this issue gets resolved: https://github.com/RasCarlito/axios-cache-adapter/issues/99.
At of this writing it seems that a fix for the issue might possibly be in version 0.20
