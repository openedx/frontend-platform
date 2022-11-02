**Description:**

Describe what this pull request changes, and why. Include implications for people using this change.

**Merge checklist:**

- [ ] Consider running your code modifications in the included example app within `frontend-platform`. This can be done by running `npm start` and opening http://localhost:8080.
- [ ] Consider testing your code modifications in another local micro-frontend using local aliases configured via [the `module.config.js` file in `frontend-build`](https://github.com/openedx/frontend-build#local-module-configuration-for-webpack).
- [ ] Verify your commit title/body conforms to the conventional commits format (e.g., `fix`, `feat`) and is appropriate for your code change. Consider whether your code is a breaking change, and modify your commit accordingly.
  - [ ] Verify intended release version at https://github.com/semantic-release/semantic-release#how-does-it-work

**For Major Release Only**
- [ ] Update dependency/peer dependency repo to support the breaking change
  - [ ] https://github.com/openedx/frontend-component-footer
    - Example: https://github.com/openedx/frontend-component-footer/pull/241
  - [ ] https://github.com/openedx/frontend-component-header
    - Example: https://github.com/openedx/frontend-component-header/pull/275
  - [ ] https://github.com/edx/frontend-component-footer-edx
    - Example: https://github.com/edx/frontend-component-footer-edx/pull/208
  - [ ] https://github.com/edx/frontend-component-header-edx
    1. [ ] update `@edx/frontend-enterprise-catalog-search`, `@edx/frontend-enterprise-logistration`, `@edx/frontend-enterprise-utils` to use the same peer dependency
        - Example: https://github.com/openedx/frontend-enterprise/pull/278
    2. [ ] upgrade the release package to `frontend-component-header-edx`
        - Example: ....

**Post merge:**

- [ ] After the build finishes for the merged commit, verify the new release has been pushed to [NPM](https://www.npmjs.com/package/@edx/frontend-platform).
