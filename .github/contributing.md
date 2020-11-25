# VitePress Contributing Guide

Hi! We're really excited that you are interested in contributing to VitePress. Before submitting your contribution, please make sure to take a moment and read through the following guidelines:

- [Code of Conduct](https://github.com/vuejs/vue/blob/dev/.github/CODE_OF_CONDUCT.md)
- [Pull Request Guidelines](#pull-request-guidelines)

## Pull Request Guidelines

- Checkout a topic branch from the relevant branch, e.g. `master`, and merge back against that branch.

- If adding a new feature:

  - Provide a convincing reason to add this feature. Ideally, you should open a suggestion issue first and have it approved before working on it.

- If fixing bug:

  - Provide a detailed description of the bug in the PR. Live demo preferred.

- It's OK to have multiple small commits as you work on the PR - GitHub can automatically squash them before merging.

- Commit messages must follow the [commit message convention](./commit-convention.md) so that changelogs can be automatically generated.

## Development Setup

You will need [Yarn](https://classic.yarnpkg.com/en/docs/cli/install/)/

After cloning the repo, run:

```bash
$ yarn # install the dependencies of the project
```

### Setup VitePress Dev Environment

You may start VitePress local dev environment by running `yarn dev`.

```bash
$ yarn dev
```

The easiest way to start testing out VitePress is to tweak the VitePress docs. You may run `yarn docs` folder to boot up VitePress documentation site locally, with live reloading of the source code.

```bash
$ yarn docs
```

After executing the above command, visit http://localhost:3000 and try modifying the source code. You'll get live update.
