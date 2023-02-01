# 路由 {#routing}

VitePress 是基于文件系统的路由，这意味着源文件的目录结构与最终的 URL 相对应。你也可以自定义目录结构和 URL 的映射。阅读本页面，了解有关 VitePress 路由系统的一切。

## 路由的基本用法 {#basic-routing}

默认情况下，VitePress 假设你的页面文件存储在项目根部。在这里你可以添加 markdown 文件，其名称为 URL 路径。例如，当你有以下目录结构时：

```
.
├─ guide
│  ├─ getting-started.md
│  └─ index.md
├─ index.md
└─ prologue.md
```

然后你可以通过以下 URL 访问这些页面。

```
index.md           -> /
prologue.md        -> /prologue.html
guide/index.md     -> /guide/
getting-started.md -> /guide/getting-started.html
```

正如你所看到的，目录结构与最终的 URL 相对应，就像从一个典型的网络服务器托管纯 HTML 一样。

## 改变根目录 {#changing-the-root-directory}

要改变你的页面文件的根目录，你可以把目录名称传给 `vitepress` 命令。例如，如果你想把你的页面文件存放在 `docs` 目录下，那么你应该运行 `vitepress dev docs` 命令。

```
.
├─ docs
│  ├─ getting-started.md
│  └─ index.md
└─ ...
```

```
vitepress dev docs
```

这将会映射到如下的 URL：

```
docs/index.md           -> /
docs/getting-started.md -> /getting-started.html
```

你也可以在配置文件中通过 [srcDir](/config/app-configs#srcdir) 选项自定义根目录。使用以下设置运行 `vitepress dev`，与运行 `vitepress dev docs` 命令的效果相同。

```ts
export default {
  srcDir: './docs'
}
```

## 建立页面之间的链接 {#linking-between-pages}

在页面中添加链接时，省略路径中的扩展名，VitePress 将根据你的配置来处理扩展名。

```md
<!-- Do -->
[Getting Started](/guide/getting-started)
[Getting Started](../guide/getting-started)

<!-- Don't -->
[Getting Started](/guide/getting-started.md)
[Getting Started](/guide/getting-started.html)
```

了解更多关于页面链接和资源链接的信息，如图片链接，参见[资源处理](asset-handling)。

## 生成简洁的 URL {#generate-clean-url}

 "简洁的 URL" 通常是指没有 `.html` 扩展名的 URL。比如我们使用 `example.com/path` 而不是 `example.com/path.html`。

默认情况下，VitePress 生成最终的静态页面文件时，在每个文件中添加 `.html`扩展名。如果你想拥有简洁的 URL，你可以只使用 `index.html` 文件来构造你的目录。

```
.
├─ getting-started
│  └─ index.md
├─ installation
│  └─ index.md
└─ index.md
```

然而，你也可以通过设置 [`cleanUrls`](/config/app-configs#cleanurls) 选项生成一个简洁的URL。

```ts
export default {
  cleanUrls: true
}
```

## 自定义映射 {#customize-the-mappings}

你可以自定义目录结构和 URL 之间的映射。当你有复杂的文件结构时，这很有用。例如，假设你有几个包，想把文档和源文件放在一起，像这样:

```
.
├─ packages
│  ├─ pkg-a
│  │  └─ src
│  │      ├─ pkg-a-code.ts
│  │      └─ pkg-a-code.md
│  └─ pkg-b
│     └─ src
│         ├─ pkg-b-code.ts
│         └─ pkg-b-code.md
```

并且你希望按如下方式生成 VitePress 页面。

```
packages/pkg-a/src/pkg-a-code.md -> /pkg-a/pkg-a-code.md
packages/pkg-b/src/pkg-b-code.md -> /pkg-b/pkg-b-code.md
```

可以像这样通过 [`rewrites`](/config/app-configs#rewrites) 选项配置映射。

```ts
export default {
  rewrites: {
    'packages/pkg-a/src/pkg-a-code.md': 'pkg-a/pkg-a-code',
    'packages/pkg-b/src/pkg-b-code.md': 'pkg-b/pkg-b-code'
  }
}
```

 `rewrites` 选项也可以有动态路由参数。在这个例子中，`package` 和 `src` 有固定的路径，在所有的页面上都相同，而且在你添加页面的时候，必须在你的配置中列出所有的页面，看起来这有点重复。所以你可以按下面的方法配置上述映射，并得到同样的结果。

```ts
export default {
  rewrites: {
    'packages/:pkg/src/:page': ':pkg/:page'
  }
}
```

路由参数前缀为 `:` (e.g. `:pkg`)。参数的名称只是一个占位符，可以是任何东西。

另外你可能会在参数的末尾添加 `*` 以映射所有子目录。

```ts
export default {
  rewrites: {
    'packages/:pkg/src/:page*': ':pkg/:page*'
  }
}
```

上述内容将创建如下映射。

```
packages/pkg-a/src/pkg-a-code.md  -> /pkg-a/pkg-a-code
packages/pkg-b/src/folder/file.md -> /pkg-b/folder/file
```

::: warning 你需要在添加页面时重新启动服务器
目前，VitePress 无法检测到映射目录中的页面添加情况。在开发模式下从目录中添加或删除文件时，你需要重新启动你的服务器。更新已经存在的文件则不需要。
:::

### 处理页面中的使用相对路径的链接 {#relative-link-handling-in-page}

请注意，当启用 `rewrites` 时，markdown 中的相对路径链接是相对于最终路径解析的。例如，为了创建从 `packages/pkg-a/src/pkg-a-code.md` 到 `packages/pkg-b/src/pkg-b-code.md` 的相对路径链接，你应该像下面这样定义链接。

```md
[Link to PKG B](../pkg-b/pkg-b-code)
```