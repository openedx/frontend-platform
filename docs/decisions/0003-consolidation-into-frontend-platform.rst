Consolidation of libraries into frontend-platform
=================================================

Status
------

Accepted

Context
-------

The frontend-platform repository replaces five earlier repositories:

- edx/frontend-analytics
- edx/frontend-auth
- edx/frontend-base
- edx/frontend-i18n
- edx/frontend-logging

We found that development across these five libraries was growing very difficult in a number of ways.

Dependency graph complexity
~~~~~~~~~~~~~~~~~~~~~~~~~~~

The overhead involved in maintaining individual packages and semantic version numbers was very difficult to reason about and maintain.  Updates to low-level packages tended to cause cascading updates through the dependency tree.  If a breaking change or incompatibility present in the tree forces dependent packages to absorb unrelated work, it can be very difficult to realize it's happening,  decreasing developer velocity and destabilizing our applications.

As a rough illustration of this complexity:

- 12 Micro-frontends depend on 5 libraries. (60 edges max)
- 12 Micro-frontends depend on 5 reusable organisms (headers, footers, Paragon) (60 edges max)
- 5 Reusable organisms depend on the 5 libraries. (25 edges max)
- The 5 libraries sometimes depend on each other. (8 edges total)

This graph has 153 possible edges, each of which represents a version number with its own set of compatibilities.  By combining the libraries, we drop the number of edges to 77.  Further combining some of our reusable organisms could get this number as low as 51.

For a single micro-frontend, these numbers go from 43 to 11, then 9.

Difficult cross-cutting feature development
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Often we've found that features and bug fixes require us to work in several of the above repositories simultaneously.  Getting npm to link packages from peer directories is tedious and error prone, making this kind of work difficult to get right.

Interdependent services
~~~~~~~~~~~~~~~~~~~~~~~

Going along with the difficulty of cross-cutting concerns, we realized at some point that many of packages were simply rather inter-connected.  Meaningful features and behaviors span packages, especially with respect to frontend-base's usage of the other libraries.  This means that validating correct behavior requires a fully functioning system; developing the libraries in isolation prevented us from doing substantive integration testing.

Decision
--------

By collapsing these libraries into a single repository published together under a single version number, we drastically reduce the layers of complexity involved in publishing new library versions.
Note that this is a tactical technology choice - architecturally and strategically, the libraries are still independent and contain strong boundaries isolating them from each other.

Note that we've preserved the platform's ability to utilize different service implementations, meaning that using the platform does not preclude applications from providing customized/extended functionality.  This means that we haven't really lost much flexibility by the consolidation.

Alternatives
------------

We strongly considered making a Lerna monorepo with each of the original five packages published with its own version number.  There were two problems with this approach - first, it wouldn't address the dependency graph complexity, which was one of the most difficult-to-reason aspects of the original repositories.  Secondary to that, our usage of babel and building to a dist directory erases some of the developer experience benefits of using Lerna.  One of Lerna's strengths is that it automatically rewires your package.json dependencies to point at other packages in the repository, rather than pulling them down from the package registry.  Since we have a build step, we'd have to manually build each package any time we wanted to use it, which isn't all that different from what we had to do with the five separate repos.  Lerna just didn't really seem worth it.

Adoption
--------

As of this writing, frontend-platform is in use in four of our existing micro-frontends.  It's our intention to help teams migrate the others (approximately 8) to use the platform as well, and to archive the five legacy implementations mentioned above.

The platform's API surface is very similar to the original five libraries, simply with a different import package.  If necessary, we expect that consumers of the old libraries will be able to do gradual, partial upgrades by cutting over individual libraries until they reach full adoption.

Consequences
------------

If we collapse these libraries into a single versioned platform, consumers of the platform (applications) may still have to absorb undesired breaking changes at times, but we've greatly reduced the complexity of doing so.  Updating an application or dependent library involves consulting a single changelog for breaking changes, rather than five and trying to reason which are compatible with each other.
