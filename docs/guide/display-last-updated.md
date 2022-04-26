# Display last updated time

VitePress supports displaying the last updated time of a page. It relies on the full history of `git` to display the right timestamp. However, on the Deploy & CI platforms, there may not have the full history of the repository.
For example, if you are using GitHub Action to build the VitePress project, the default settings of the [actions/checkout](https://github.com/actions/checkout) will not fetch the full depth of your repository. And you will need to add the `fetch-depth: 0` in your GitHub Action configuration:

```yml
- uses: actions/checkout@v3
  with:
    fetch-depth: 0
```

See [fetch-all-history-for-all-tags-and-branches](https://github.com/actions/checkout#fetch-all-history-for-all-tags-and-branches) for more details.

On Vercel, you will need to add the `VERCEL_DEEP_CLONE=true` environment variable to your project settings, or the Vercel will only fetch `--depth 10` of the repository.

## Using an alternative git implementation
VitePress uses the `git` command to fetch the history of files, it needs to spawn a child process to run the `git` command. This does not cause performance problems in general. However, if you have tons of pages, it may slower the build. And it also relies on the system `git` program, in some environments you may not have the `git` program on the system, like in Docker environments.

You can use an alternative git implementation to make the build faster, and it also doesn't rely on the system `git`:
[`@napi-rs/simple-git`](https://npmjs.com/package/@napi-rs/simple-git).

You can install it so that VitePress will use it rather than the system `git`:

- `pnpm add @napi-rs/simple-git --dev`
- `yarn add @napi-rs/simple-git --dev`
- `npm install @napi-rs/simple-git --dev`

No more configuration is needed, VitePress will use it automatically.