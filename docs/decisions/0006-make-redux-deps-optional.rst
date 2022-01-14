Consumers of frontend-platform that don't use redux are still required to install redux dependencies
==========================================

Status
------

Review

Context
-------

Some consumers of frontend-platform, such as frontend-app-learner-portal-enterprise, no longer use redux or react-redux.
However, they are still required to install these dependencies due to the usage of react-redux in AppProvider, and the fact that
react-redux and redux are peerDependencies. To be precise, the OptionalReduxProvider used by AppProvider is what uses the
react-redux Provider in case a store prop is passed to AppProvider.

However, it's only optional from a code perspecitve, it's not optional from a dependency perspective right now.

This means there is extra overhead and confusion on seeing 'redux' and 'react-redux' in such projects, when they are not leveraging the `store` feature of AppProvider.

It will be great to be able to not have to include redux and react-redux as dependencies in such cases.

Decision
--------

A method to enable the removal of the dependencies `redux` and `react-redux` from mentioned client projects is to leverage optionalDependencies.

According to `npm documentation <https://docs.npmjs.com/cli/v8/configuring-npm/package-json#optionaldependencies>`_:

> optionalDependencies are dependencies that do not necessarily need to be installed.
  If a dependency can be used, but you would like npm to proceed if it cannot be found or fails to install,
  then you may put it in the optionalDependencies object.

Therefore if we were to move the redux and react-redux into optionalDependencies instead, consumers will no longer fail build
when these deps are missing.

In addition, since the `OptionalReduxProvider` makes use of the import of react-redux, it may need to also make a safe import such that
a missing package react-redux does not cause a failure, as noted in the above link. Instead it can simply detect the absence of the package
and return, something like this::

    if (store === null || !Provider) {
        return (
        <>{children}</>
        );
    }


Consequences
--------

For consumers that use frontend-platform but do make use of the redux store feature of AppProvider, there should be no impact.

However, for consumers that do not use that feature, they should no longer need to depend on redux or react-redux.

Also, this will help bundle sizes to be smaller for consumers where this exclusion applies.
