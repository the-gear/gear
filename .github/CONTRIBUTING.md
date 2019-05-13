# Contributing

First of all, thanks for your interest in contributing to The ⚙️ Gear `monorepo`! 🎉

PRs are the preferred way to spike ideas and address issues, if you have time. If you plan on contributing frequently, please feel free to ask to become a maintainer; the more the merrier. 🤙

## Technical overview

This monorepo uses following libraries for development:

- [`yarn` with workspaces](https://yarnpkg.com/lang/en/docs/workspaces/) for package management
- [`lerna`](https://lerna.js.org/) for spawning tasks
- [`typescript`](http://www.typescriptlang.org/) for typed JavaScript and transpilation
- [`jest`](https://jestjs.io/) for unit testing
  - run `yarn test:watch` during development
- [`rollup`](https://rollupjs.org/guide/en) for creating UMD bundles
- [various package scripts](https://docs.npmjs.com/misc/scripts) for executing tasks

## Getting started

### Creating a Pull Request

If you've never submitted a Pull request before please visit http://makeapullrequest.com/ to learn everything you need to know.

#### Setup

1.  Fork the repo.
2.  `git clone` your fork.
3.  Make a `git checkout -b branch-name` branch for your change.
4.  Run `yarn install` (make sure you have node and yarn installed first)

#### Updates

1.  Make sure to **add tests**
2.  If there is a `*.test.ts` file, update it to include a test for your change, if needed.
    If this file doesn't exist, please create it.
3.  Run `yarn test` or `yarn test:watch` to make sure all tests are working, regardless if a test was added.

### Commit Message Format

We use https://conventionalcommits.org/ message format. you can use `yarn commit` to invoke a CLI tool which will guide you through the process.

## License

By contributing your code to The ⚙️ Gear `monorepo` GitHub Repository, you agree to license your contribution under the MIT license.
