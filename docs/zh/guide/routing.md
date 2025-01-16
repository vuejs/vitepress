---
outline: deep
---

# 路由 {#routing}

## 基于文件的路由 {#file-based-routing}

VitePress 使用基于文件的路由，这意味着生成的 HTML 页面是从源 Markdown 文件的目录结构映射而来的。例如，给定以下目录结构：

```
.
├─ guide
│  ├─ getting-started.md
│  └─ index.md
├─ index.md
└─ prologue.md
```

生成的 HTML 页面会是这样：

```
index.md                  -->  /index.html (可以通过 / 访问)
prologue.md               -->  /prologue.html
guide/index.md            -->  /guide/index.html (可以通过 /guide/ 访问)
guide/getting-started.md  -->  /guide/getting-started.html
```

生成的 HTML 可以托管在任何支持静态文件的 Web 服务器上。

## 根目录和源目录 {#root-and-source-directory}

VitePress 项目的文件结构中有两个重要的概念：项目根目录 (**project root**) 和源目录 (**source directory**)。

### 项目根目录 {#project-root}

项目根目录是 VitePress 将尝试寻找 `.vitepress` 特殊目录的地方。`.vitepress` 目录是 VitePress 配置文件、开发服务器缓存、构建输出和可选主题自定义代码的预留位置。

当从命令行运行 `vitepress dev` 或 `vitepress build` 时，VitePress 将使用当前工作目录作为项目根目录。要将子目录指定为根目录，需要将相对路径传递给命令。例如，如果 VitePress 项目位于 `./docs`，应该运行 `vitepress dev docs`：

```
.
├─ docs                    # 项目根目录
│  ├─ .vitepress           # 配置目录
│  ├─ getting-started.md
│  └─ index.md
└─ ...
```

```sh
vitepress dev docs
```

这将导致以下源代码到 HTML 的映射：

```
docs/index.md            -->  /index.html (可以通过 / 访问)
docs/getting-started.md  -->  /getting-started.html
```

### 源目录 {#source-directory}

源目录是 Markdown 源文件所在的位置。默认情况下，它与项目根目录相同。但是，可以通过 [`srcDir`](../reference/site-config#srcdir) 配置选项对其进行配置。

`srcDir` 选项是相对于项目根目录解析的。例如，对于 `srcDir: 'src'`，文件结构将如下所示：

```
.                          # 项目根目录
├─ .vitepress              # 配置目录
└─ src                     # 源目录
   ├─ getting-started.md
   └─ index.md
```

生成的源代码到 HTML 的映射：

```
src/index.md            -->  /index.html (可以通过 / 访问)
src/getting-started.md  -->  /getting-started.html
```

## 链接页面 {#linking-between-pages}

在页面之间链接时，可以使用绝对路径和相对路径。请注意，虽然 `.md` 和 `.html` 扩展名都可以使用，但最佳做法是省略文件扩展名，以便 VitePress 可以根据配置生成最终的 URL。

```md
<!-- Do -->
[Getting Started](./getting-started)
[Getting Started](../guide/getting-started)

<!-- Don't -->
[Getting Started](./getting-started.md)
[Getting Started](./getting-started.html)
```

在[资源处理](./asset-handling)中了解有关链接到资源（例如图像）的更多信息。

### 链接到非 VitePress 页面 {#linking-to-non-vitepress-pages}

如果想链接到站点中不是由 VitePress 生成的页面，需要使用完整的 URL（在新选项卡中打开）或明确指定 target：

**输入**

```md
[Link to pure.html](/pure.html){target="_self"}
```

**输出**

[Link to pure.html](/pure.html){target="_self"}

::: tip 注意

在 Markdown 链接中，`base` 会自动添加到 URL 前面。这意味着，如果想链接到 `base` 之外的页面，则链接中需要类似 `../../pure.html` 的内容（由浏览器相对于当前页面解析）。

或者，可以直接使用锚标记语法：

```md
<a href="/pure.html" target="_self">Link to pure.html</a>
```

:::

## 生成简洁的 URL {#generating-clean-url}

:::warning 需要服务器支持
要使 VitePress 提供简洁 URL，需要服务器端支持。
:::

默认情况下，VitePress 将入站链接解析为以 `.html` 结尾的 URL。但是，一些用户可能更喜欢没有 .html 扩展名的“简洁 URL”——例如，`example.com/path` 而不是 `example.com/path.html`。

某些服务器或托管平台 (例如 Netlify、Vercel 或 GitHub Pages) 提供将 `/foo` 之类的 URL 映射到 `/foo.html` (如果存在) 的功能，而无需重定向：

- Netlify 和 GitHub Pages 是默认支持的。
- Vercel 需要在 [vercel.json 中启用 cleanUrls 选项](https://vercel.com/docs/concepts/projects/project-configuration#cleanurls)。

如果可以使用此功能，还可以启用 VitePress 自己的 [`cleanUrls`](../reference/site-config#cleanurls) 配置选项，以便：

- 页面之间的入站链接是在没有 `.html` 扩展名的情况下生成的。
- 如果当前路径以 `.html` 结尾，路由器将执行客户端重定向到无扩展路径。

但是，如果无法为服务器配置此类支持，则必须手动采用以下目录结构：

```
.
├─ getting-started
│  └─ index.md
├─ installation
│  └─ index.md
└─ index.md
```

## 路由重写 {#route-rewrites}

可以自定义源目录结构和生成页面之间的映射。当有一个复杂的项目结构时，它很有用。例如，假设有一个包含多个包的 monorepo，并且希望将文档与源文件一起放置，如下所示：

```
.
├─ packages
│  ├─ pkg-a
│  │  └─ src
│  │      ├─ pkg-a-code.ts
│  │      └─ pkg-a-docs.md
│  └─ pkg-b
│     └─ src
│         ├─ pkg-b-code.ts
│         └─ pkg-b-docs.md
```

希望像这样生成 VitePress 页面：

```
packages/pkg-a/src/pkg-a-docs.md  -->  /pkg-a/index.html
packages/pkg-b/src/pkg-b-docs.md  -->  /pkg-b/index.html
```

可以通过像这样配置 [`rewrites`](../reference/site-config#rewrites) 选项来实现此目的：

```ts [.vitepress/config.js]
export default {
  rewrites: {
    'packages/pkg-a/src/pkg-a-docs.md': 'pkg-a/index.md',
    'packages/pkg-b/src/pkg-b-docs.md': 'pkg-b/index.md'
  }
}
```

`rewrites` 选项还支持动态路由参数。在上面的示例中，如果有很多包，则列出所有路径会很冗长。鉴于它们都具有相同的文件结构，可以像这样简化配置：

```ts
export default {
  rewrites: {
    'packages/:pkg/src/(.*)': ':pkg/index.md'
  }
}
```

重写路径是使用 `path-to-regexp` 包编译的——请参阅其[文档](https://github.com/pillarjs/path-to-regexp#parameters)以获取更多语法。

::: warning 开启重写功能时使用相对链接

启用重写后，**相对链接应基于重写的路径**。例如，为了创建从 `packages/pkg-a/src/pkg-a-code.md` 到 `packages/pkg-b/src/pkg-b-code.md` 的相对链接，应该使用：

```md
[Link to PKG B](../pkg-b/pkg-b-code)
```
:::

## 动态路由 {#dynamic-routes}

可以使用单个 Markdown 文件和动态数据生成许多页面。例如，可以创建一个 `packages/[pkg].md` 文件，为项目中的每个包生成相应的页面。这里，`[pkg]` 段是一个路由参数，用于区分每个页面。

### 路径加载文件 {#paths-loader-file}

由于 VitePress 是静态站点生成器，因此**必须**在构建时确定可能的页面路径。因此，动态路由页面必须伴随**路径加载文件**。对于 `packages/[pkg].md`，我们需要 `packages/[pkg].paths.js` (也支持 `.ts`)：

```
.
└─ packages
   ├─ [pkg].md         # 路由模板
   └─ [pkg].paths.js   # 路由路径加载器
```

路径加载器应该提供一个带有 `paths` 方法的对象作为其默认导出。`paths` 方法应返回具有 `params` 属性的对象数组。这些对象中的每一个都将生成一个相应的页面。

给定以下 `paths` 数组：

```js
// packages/[pkg].paths.js
export default {
  paths() {
    return [
      { params: { pkg: 'foo' }},
      { params: { pkg: 'bar' }}
    ]
  }
}
```

生成的 HTML 页面将会是：

```
.
└─ packages
   ├─ foo.html
   └─ bar.html
```

### 多参数 {#multiple-params}

动态路由可以包含多个参数：

**文件结构**

```
.
└─ packages
   ├─ [pkg]-[version].md
   └─ [pkg]-[version].paths.js
```

**路径加载器**

```js
export default {
  paths: () => [
    { params: { pkg: 'foo', version: '1.0.0' }},
    { params: { pkg: 'foo', version: '2.0.0' }},
    { params: { pkg: 'bar', version: '1.0.0' }},
    { params: { pkg: 'bar', version: '2.0.0' }}
  ]
}
```

**输出**

```
.
└─ packages
   ├─ foo-1.0.0.html
   ├─ foo-2.0.0.html
   ├─ bar-1.0.0.html
   └─ bar-2.0.0.html
```

### 动态生成路径 {#dynamically-generating-paths}

路径加载器模块在 Node.js 中运行，并且仅在构建期间执行。可以使用本地或远程的任何数据动态生成路径数组。

从本地文件生成路径：

```js
import fs from 'fs'

export default {
  paths() {
    return fs
      .readdirSync('packages')
      .map((pkg) => {
        return { params: { pkg }}
      })
  }
}
```

从远程数据生成路径：

```js
export default {
  async paths() {
    const pkgs = await (await fetch('https://my-api.com/packages')).json()

    return pkgs.map((pkg) => {
      return {
        params: {
          pkg: pkg.name,
          version: pkg.version
        }
      }
    })
  }
}
```

### 访问页面中的参数 {#accessing-params-in-page}

可以使用参数将附加数据传递到每个页面。Markdown 路由文件可以通过 `$params` 全局属性访问 Vue 表达式中的当前页面参数：

```md
- package name: {{ $params.pkg }}
- version: {{ $params.version }}
```

还可以通过 [`useData`](../reference/runtime-api#usedata) 运行时 API 访问当前页面的参数。这在 Markdown 文件和 Vue 组件中都可用：

```vue
<script setup>
import { useData } from 'vitepress'

// params 是一个 Vue ref
const { params } = useData()

console.log(params.value)
</script>
```

### 渲染原始内容 {#rendering-raw-content}

传递给页面的参数将在客户端 JavaScript payload 中序列化，因此应该避免在参数中传递大量数据，例如从远程 CMS 获取的原始 Markdown 或 HTML 内容。

相反，可以使用每个路径对象上的 `content` 属性将此类内容传递到每个页面：

```js
export default {
  async paths() {
    const posts = await (await fetch('https://my-cms.com/blog-posts')).json()

    return posts.map((post) => {
      return {
        params: { id: post.id },
        content: post.content // 原始 Markdown 或 HTML
      }
    })
  }
}
```

然后，使用以下特殊语法将内容呈现为 Markdown 文件本身的一部分：

```md
<!-- @content -->
```
