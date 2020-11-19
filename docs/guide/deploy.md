# Deploying

The following guides are based on some shared assumptions:

- You are placing your docs inside the `docs` directory of your project;
- You are using the default build output location (`.vitepress/dist`);
- VuePress is installed as a local dependency in your project, and you have setup the following npm scripts:

```json
{
  "scripts": {
    "docs:build": "vuepress build docs",
    "docs:serve": "vuepress serve docs"
  }
}
```

## Building The Docs

You may run `yarn docs:build` command to build the docs.

```bash
$ yarn docs:build
```

By default, the build output will be placed at `.vitepress/dist`. You may deploy this `dist` folder to any of your preferred platforms.

### Testing The Docs Locally

Once you've built the docs, you may test them locally by running `yarn docs:serve` command.

```bash
$ yarn docs:build
$ yarn docs:serve
```

The `serve` command will boot up local static web server that serves the files from `.vitepress/dist` at http://localhost:3000. It's an easy way to check if the production build looks OK in your local environment.

You may configure the port of the server py passing `--port` flag as an argument.

```json
{
  "scripts": {
    "docs:serve": "vuepress serve docs --port 8080"
  }
}
```

Now the `docs:serve` method will launch the server at http://localhost:8080.
