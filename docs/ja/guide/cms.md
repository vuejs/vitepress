---
outline: deep
---

# Connecting to a CMS

## General Workflow

Connecting VitePress to a CMS will largely revolve around [Dynamic Routes](./routing#dynamic-routes). Make sure to understand how it works before proceeding.

Since each CMS will work differently, here we can only provide a generic workflow that you will need to adapt to your specific scenario.

1. If your CMS requires authentication, create an `.env` file to store your API tokens and load it so:

    ```js
    // posts/[id].paths.js
    import { loadEnv } from 'vitepress'

    const env = loadEnv('', process.cwd())
    ```

2. Fetch the necessary data from the CMS and format it into proper paths data:

    ```js
    export default {
      async paths() {
        // use respective CMS client library if needed
        const data = await (await fetch('https://my-cms-api', {
          headers: {
            // token if necessary
          }
        })).json()

        return data.map(entry => {
          return {
            params: { id: entry.id, /* title, authors, date etc. */ },
            content: entry.content
          }
        })
      }
    }
    ```

3. Render the content in the page:

    ```md
    # {{ $params.title }}

    - by {{ $params.author }} on {{ $params.date }}

    <!-- @content -->
    ```

## Integration Guides

If you have written a guide on integrating VitePress with a specific CMS, please use the "Edit this page" link below to submit it here!
