# Contributing

This is a guide to help those who are interested in contributing to VitePress!

## Prerequisites

- [yarn](https://classic.yarnpkg.com/en/docs/cli/install/)

## Instructions

### Setup VitePress dev environment

1. Clone the VitePress repo
1. Install dependencies
    ```
    yarn
    ```
1. Create symlink to allow projects to link to local VitePress dev environment
    ```bash
    yarn link
    ```
    - If it's successful, you should see the following message:
    ```
    success Registered "vitepress".
    info You can now run `yarn link "vitepress"` in the projects where you want to use this package and it will be used instead.
    ✨  Done in 0.05s.
    ```
1. Start VitePress local dev environment
    ```bash
    yarn dev
    ```



### Setup local VitePress project

1. Open up terminal
1. Create a new folder
1. Initialize with `npm init`
1. Create a `docs` directory
1. Create an `index.md` file with some content inside of `/docs`
1. Add dependency to local VitePress dev environment
    ```bash
    yarn link vitepress
    ```
1. Add script to run VitePress in `package.json`
    - The following sample uses the command `dev` and assumes your VitePress site will live in the folder `docs`
    ```json
    {
      "name": "vitepress-project",
      "dependencies": {},
      "devDependencies": {},
      "scripts": {
        "dev": "vitepress dev docs",
        "test": "echo \"Error: no test specified\" && exit 1"
      }
    }
    ```
    - If successful, you should see a similar message to the following;
    ```
    $ vitepress dev docs
    vitepress v0.3.1
    vite v0.20.2
    listening at http://localhost:3000
    ```

And with that, you are now ready to contribute to the VitePress project! 🎉