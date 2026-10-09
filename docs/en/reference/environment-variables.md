---
outline: deep
---

# Environment Variables

## Basic Workflow

Using environment variables in VitePress is essential for managing sensitive data such as API keys and service URLs.
VitePress allows you to load environment variables from `.env` files using the `loadEnv` function to load these variables into your configuration (e.g. `.vitepress/config.ts`).

### Step 1: Create the .env File

The first step in setting up environment variables is to create a `.env` file in the root directory of your VitePress project.
This file will store your sensitive information and configuration settings.

### Step 2: Defining Environment Variables

Open the `.env` file and define your environment variables.
Remember that in Vite, all environment variables that need to be exposed to your application must be prefixed with `VITE_.` Here’s an example of what your `.env` file might look like

```bash
VITE_ALGOLIA_APP_ID=your_algolia_app_id
VITE_ALGOLIA_API_KEY=your_algolia_api_key
VITE_ALGOLIA_INDEX_NAME=your_algolia_index_name
```

### Step 3: Load Environment Variables in VitePress Configuration

Next, you need to load these environment variables into your VitePress configuration. This is done using the `loadEnv` function from VitePress.

```js
import { loadEnv } from 'vitepress';

// Load environment variables
const env = loadEnv('', process.cwd());
```

### Step 4: Accessing Environment Variables in Your Application

for example, configuring your blog to use Algolia

```js
import { loadEnv } from 'vitepress';
import { defineConfig } from 'vitepress';

// Load environment variables
const env = loadEnv('', process.cwd());

export default defineConfig({
  themeConfig: {
    search: {
      provider: 'algolia',
      options: {
        appId: env.VITE_ALGOLIA_APP_ID,
        apiKey: env.VITE_ALGOLIA_API_KEY,
        indexName: env.VITE_ALGOLIA_INDEX_NAME,
      },
    },
  },
});

```

## Important Considerations

- **Prefix Requirement**: Ensure all relevant environment variables are prefixed with `VITE_`. Only these will be accessible in your application.
- **File Loading Order**: Vite loads `.env` files based on specific priorities. For example, `.env.production` will override settings from `.env`.
- **Restarting Your Server**: After making changes to your `.env` file, restart your VitePress server for changes to take effect.
