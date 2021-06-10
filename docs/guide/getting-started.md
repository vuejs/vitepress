# Getting Started

This section will help you build a basic VitePress documentation site from ground up. If you already have an existing project and would like to keep documentation inside the project, start from Step 3.

- **Step. 1:** Create and change into a new directory.

  ```bash
  $ mkdir vitepress-starter && cd vitepress-starter
  ```

- **Step. 2:** Initialize with your preferred package manager.

  <CodeGroup>
  <CodeBlock title="YARN" active>
  ```bash
  $ yarn init
  ```
  </CodeBlock>
  
  <CodeBlock title="NPM">
  ```bash
  $ npm init
  ```
  </CodeBlock>
  </CodeGroup>

- **Step. 3:** Install VitePress locally.

  <CodeGroup>
  <CodeBlock title="YARN" active>
  ```bash
  $ yarn add --dev vitepress
  ```
  </CodeBlock>

  <CodeBlock title="NPM">
  ```bash
  $ npm install --dev vitepress
  ```
  </CodeBlock>
  </CodeGroup>

- **Step. 4:** Create your first document.

  ```bash
  $ mkdir docs && echo '# Hello VitePress' > docs/index.md
  ```

- **Step. 5:** Add some scripts to `package.json`.

  ```json
  {
    "scripts": {
      "docs:dev": "vitepress dev docs",
      "docs:build": "vitepress build docs",
      "docs:serve": "vitepress serve docs"
    }
  }
  ```

- **Step. 6:** Serve the documentation site in the local server.

  <CodeGroup>
  <CodeBlock title="YARN" active>
  ```bash
  $ yarn docs:dev
  ```
  </CodeBlock>

  <CodeBlock title="NPM">
  ```bash
  $ yarn run docs:dev
  ```
  </CodeBlock>
  </CodeGroup>

  VitePress will start a hot-reloading development server at http://localhost:3000.

By now, you should have a basic but functional VitePress documentation site.

When your documentation site starts to take shape, be sure to read the [deployment guide](./deploy).
