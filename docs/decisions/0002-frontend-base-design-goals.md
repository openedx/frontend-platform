# frontend-base Design Goals

## Status

Accepted

## Goals

The creation of frontend-base framework was motivated by a few desires and concerns.

### Code reuse

We wanted to "DRY" up boilerplate code that was being copied from repository to repository each time we created a new micro-frontend.

We observed that as the code was copied around, it tended to drift, and later implementations had different - and often better - best practices than the ones that came before.  Worse, if a fix went in to an older application, we had no way to easily carry that forward.  This meant we had no guarantee that our applications had the correct infrastructure for analytics, logging, i18n, error handling, observability, and authentication.

### Configuration standardization

Similar to code drift, we found our set of environment configuration variables were not standardized, creating a maintenance overhead and the potential for 1) applications being given variables they were unlikely to need, or worse 2) lacking required variables.  We observed that it was tedious and error prone to add a new variable across multiple applications.

### Ease of use

In writing some of our first micro-frontends, it was becoming difficult to pass some information around the application (environment configuration, authenticated user data, and the authenticated API client, specifically), while still maintaining a sense of modularity.  We were using dependency injection, but it was a heavy-handed implementation that involved a hierarchical set of "configure()" methods to help pass the data around.  We wanted to address this and make it straightforward to use top-level data effortlessly.

### Consistency vs. flexibility

We were concerned - with the creation of a "base" library to contain and tie together all this code - that we would hamper our ability to enable experimentation and independently deployed applications, one of our most fundamental goals in adopting a micro-frontend architecture.

This functions on two levels: 1) we wanted to maintain our ability to allow new micro-frontends to forge ahead and experiment with new technology and library features, and 2) we also wanted to ensure that our "base" library was not too prescriptive about exactly what it means to be an Open edX micro-frontend.

### Exploration of frontend pluggability

In preparation for efforts related to enabling frontend pluggability, we felt it valuable to create a layer of abstraction for applications that enabled application pages to start being "plugged into" the top-level application bootstrapping and lifecycle management code.  In doing so, we hoped to start understanding what we might encounter as we move forward with pluggability.  (This is the softest of these desires, but a helpful learning experience)

## Implementation

`frontend-base` is an attempt to address the above desires and concerns.

### Addressing code reuse

It provides a home for application initialization/configuration code, allowing us to use semantic versioning to manage its implementations across our micro-frontends.  This code will cease to be copied from repository to repository, and will instead be imported from published versions of `frontend-base`.  This allows us to know at a glance what boilerplate features/bug fixes a given application has, and a clear, documented path to upgrade and deal with breaking changes.

### Addressing ease of use

`frontend-base` makes use of a singleton class - `App` which can be imported into arbitrary code and provides access to commonly used sets of data, such as configuration variables, authenticated user information, and an API client.  This makes it trivial to access all this top level data, removing the need to manually pass it around.

### Addressing configuration standardization

The library ingests and provides access to a known set of environment variable-based configuration variables.  It validates that these variables have been set with non-`undefined` values, and provides utility methods for performing similar checks on any custom configuration that a consuming application may need.  It provides extension hooks for doing dynamic configuration at runtime, if necessary, leaving the door open for other configuration methods.  An arbitrary piece of application code can assert that it requires certain variables, throwing runtime exceptions immediately if they weren't set.  This gives developers immediate, definitive feedback of any configuration issues in their deployment pipelines.

### Addressing consistency vs. flexibility

`frontend-base` is published to npm as ES6 modules with `peerDependencies` in its package.json.  This means that consuming apps are told exactly what versions of supporting libraries (`@edx/frontend-auth`, `@edx/frontend-i18n`, `@edx/paragon`, React, etc.) are compatible with a given version of `frontend-base`.  Beyond that, applications are free to use any compatible version. This prevents `frontend-base` from being a bottleneck for updating library versions, and helps application authors avoid situations where they have to consume multiple breaking changes just to get a new feature in _one_ supporting library.

The library has an extensible and fully customizable initialization sequence.  Any phase of initialization can be modified to support unforeseen use cases while maintaining the framework as a whole.

### Addressing exploration of frontend pluggability

The process of creating `frontend-base` was conducted using `@edx/frontend-app-profile` as a test bed.  As a result, we learned how to modularize the application-specific code in the Profile micro-frontend to allow it to be consumed by a more generic application framework.  We also, tangentially, explored ways of customizing the header and footer and ensured that they could be reasonably separated from both the framework and the application code.

This resulted in a loose coupling of the `frontend-base` framework and the application code it was consuming.  The UI modules (header, footer, and profile page) are starting to coalesce around a simple interface of exports:

- A default export of the top-level React component.
- A `messages` export for i18n resources.
- A `reducer` export for Redux reducers.
- A `saga` export for the redux-saga middleware.

Furthermore, as part of `frontend-base`, we were able to separate out the application initialization sequence from the rendering of the application UI.  This means that - with the exception of its optional React component helpers and our usage of @edx/frontend-i18n - frontend-base is nearly UI framework agnostic.  It can initialize completely without being concerned about the UI framework in use, and then gracefully handoff to React or whichever else.

## Adoption

We intend to update existing micro-frontends to make use of `frontend-base`.  We've started with frontend-app-profile and are following up with frontend-app-payment.  Newer micro-frontends will be created with it as a dependency.  Other, older micro-frontends will be prioritized over time.

## Consequences

The library should go a long way toward standardizing our application initialization code and helping us keep all our micro-frontends up to date.  That's the big win.

It also provides micro-frontend developers with a strong, flexible foundation on which to build their applications.  As we discover bugs or new, fundamental features that we want our apps to be able to handle, we have one centralized place to implement them.

It was also a useful exploration of pluggability, abstraction, and separation of concerns, which should help inform our work going forward.

Furthermore, reading the tea leaves a bit, we can foresee a future where our Open edX micro-frontends are lazy-loaded modules that are plugged into frontend-base at runtime, allowing independently deployable 'pages' of a larger single-page app, which should pay dividends in user experience and application runtime performance.

## Concerns and Limitations

The choice to create `frontend-base` involves a few concerns:

One, we hope that we've made a framework that is simple, unobtrustive, extensible, and effective.  This is, admittedly, hard to do, and it's possible that as time goes on we'll find that it has certain limitations and may need to revisit it.  Specifically, it remains to be seen the extent to which it is compatible with GatsbyJS's initialization hooks (`onClientInit` and `wrapRootElement`, for instance).

Two, the library also assumes that environment-variable based configuration - via `process.env`, is sufficient for most of our needs across the organization.  This seems to be the case, but has yet to be scrutinized.  While the library allows for dynamic run-time configuration or replacing the environment variable configuration, it does not postulate on or provide another mechanism for doing so.

Three, `peerDependencies` manifest as warnings, not errors, and can be easily ignored.  In general it would be better if there was stronger enforcement of frontend-base's peer dependency requirements, but we're limited by what `npm` will provide.  It's slightly concerning that a dependency could be incompatible and we potentially wouldn't know it until runtime.
