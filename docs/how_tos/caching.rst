############################
How to: Caching API Requests
############################

Introduction
************

Often, a web application needs to make the same repeated API calls, where the data returned is mostly static (i.e., does not change often). In such situations, caching is a viable solution to prevent unnecessary and potentially expensive operations, resulting in increased performance and a better user experience.

When considering caching options, there's a few approaches to consider:

Server caching
==============

Server caching helps to limit the cost of an API request on the server and its dependent systems. When a client makes a request to the API, the server will check for a local copy of the requested resource. If the local resource exists, the server will respond with it; otherwise, the request is processed normally (e.g., performing database lookups). With this approach, the cost savings to the server may be significant, utilizing less resources.

Client caching
==============

Client caching helps to limit the cost of an API request incurred by the user. Rather than relying on a API implementing server caching, commonly referenced data may be cached locally within the client (i.e., browser). Similar to server caching, on the first request of an API, the request will occur as usual but the response data will be stored in the client. However, on subsequent requests (within a given timeframe), the client will check if a copy of the requested resource exists. If it does, it will read from the client cache rather than making a network request to the API. This has the benefit of freeing up resources on the server as it no longer needs to handle repeat queries within a given timeframe.

Typically, client caching stores data for a given time (e.g., 5 minutes) since it was last requested. This allows the client cache to be dynamic in the sense that data will be eventually consistent and unneeded local data can be cleared once it is no longer relevant.

Hybrid caching
==============

Both server and client caching can be combined to provide best of both worlds. Regardless of how an API request is made, utilizing a hybrid approach will ensure data is read from a local cache first, whether that be on the server or the client.

How do I use client caching with ``@edx/frontend-platform?``
************************************************************

The ``@edx/frontend-platform`` package supports an Axios HTTP client that uses client caching under the hood through the use of `axios-cache-adapter <https://www.npmjs.com/package/axios-cache-adapter>`_.

When importing an HTTP client from ``@edx/frontend-platform``, you may specify options for how you wish to configure the HTTP client::

  import { getAuthenticatedHttpClient } from '@edx/frontend-platform';
  
  // ``cachedHttpClient`` is configured to use client caching under the hood.
  const cachedHttpClient = getAuthenticatedHttpClient({ useCache: true });
  
The examples below demonstrate how to configure the caching behavior on a per-request basis. For more details about how to configure the caching behavior, you may refer to the `axios-cache-adapter documentation <https://www.npmjs.com/package/axios-cache-adapter>`_.
  
Modify expiry behavior for a single request
===========================================

By default, API requests using the cached HTTP client will be cached for 5 minutes. However, cache options may be configured on a per-request basis::

  cachedHttpClient.get('/courses/', {
    cache: {
      maxAge: 15 * 60 * 1000, // 15 minutes instead of the default 5.
    },
  });
  
Invalidate cache for a single request
=====================================

In certain situations, it may be necessary to invalidate cached data to force a true network request to the server::

  cachedHttpClient.get('/courses/', { clearCacheEntry: true });
  
Check if response is served from network or from cache
======================================================

If there is a need to know whether a response was served from the network (i.e., server) or from the local client cache, you may refer to the ``response.request`` object::

  cachedHttpClient.get('/courses/').then((response) => {
    console.log(response.request.fromCache); // will be true if served from the client cache
  });
