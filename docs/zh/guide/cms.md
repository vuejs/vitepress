---
outline: deep
---

# 连接到 CMS {#connecting-to-a-cms}

## 一般的工作流 {#general-workflow}

将 VitePress 连接到 CMS 主要围绕[动态路由](./routing#dynamic-routes)展开。在继续阅读之前，请确保了解它的工作原理。

由于每个 CMS 的工作方式都不同，因此我们只能提供一个通用的工作流，你需要根据具体情况进行调整。

1. 如果你的 CMS 需要身份验证，请创建一个 `.env` 文件来存储你的 API token：

    ```js
    // posts/[id].paths.js
    import { loadEnv } from 'vitepress'

    const env = loadEnv('', process.cwd())
    ```

2. 从 CMS 获取必要的数据并将其格式调整为合适的路径数据：

   ```js
    export default {
      async paths() {
        // 如有需要，使用相应的 CMS 客户端库
        const data = await (await fetch('https://my-cms-api', {
          headers: {
            // 如有必要，可使用 token
          }
        })).json()

        return data.map(entry => {
          return {
            params: { id: entry.id, /* title, authors, date 等 */ },
            content: entry.content
          }
        })
      }
    }
    ```

3. 在页面中渲染内容：

    ```md
    # {{ $params.title }}

    - by {{ $params.author }} on {{ $params.date }}

    <!-- @content -->
    ```

## 整合指南 {#integration-guides}

如果你已经写了一篇关于如何将 VitePress 与特定的 CMS 集成的指南，请点击下面的“在 GitHub 上编辑此页面”链接将它提交到这里！
