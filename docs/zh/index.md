---
sidebarDepth: 2
---

# 什么是VitePress?

::: warning WARNING
VitePress 当前处于 0.x 状态，已经适合于默认的文档使用，但是配置和主题 API 可能会在小版本中更改。
:::
VitePress 是一个基于 [Vite](https://github.com/vitejs/vite) 的 [VuePress](https://vuepress.vuejs.org/)' 兄弟项目。
## 动机

我们爱 VuePress v1，但是基于 Webpack 的构建，在一个简单的文档站点上，启动开发服务器需要的时间变得无法忍受。即使 HMR 更新也需要一秒钟才能在浏览器中反映出来！

根本原因是 VuePress v1 是基于 Webpack 的一个应用。即使只有两个页面，它也是一个完整的 Webpack 项目（包括所有主题源文件）被编译。更糟糕的是当项目有很多页面时，在服务器显示能任何东西之前每个页面都必须先完全编译！

顺便说一下，Vite 很好地解决了这些问题：瞬间的服务器启动，一次性编译只编译正在被服务的页面，以及非常快的 HMR。另外，在VuePress v1中，我还注意到一些额外的设计问题，但由于需要大量的重构，所以一直没有时间去解决。

现在，有了 Vite 和 Vue 3 是时候重新考虑一下“Vue 驱动的静态站点生成器”可以是什么样子了。

## 在VuePress v1之上的改进

和 VuePress v1 相比有几个改进的地方...

### 使用Vue 3

利用了 Vue 3 的模板静态分析来将静态内容尽可能的字符串化。静态内容被发送为字符串字面量而不是 JavaScript 渲染函数代码，因此 JS 加载 _更加_ 节省，并且渲染速度更快。

请注意，在应用优化的同时，仍然允许用户在markdown内容中自由混合Vue组件--编译器自动为你做静态/动态分离，你永远不需要考虑这个问题。

### 底层使用Vite

- 更快的开发服务器启动
- 更快的热更新
- 更快的构建（内部实现使用 Rollup ）

### 更轻量的页面

- Vue 3 tree-shaking + Rollup 分割代码
- 不会在每次请求中发送每个页面的元数据。这将页面重量与总页数分离。只会发送当前页面的元数据。客户端导航将同时获取新页面的组件和元数据。
- 不使用`vue-router`，因为VitePress的需求非常简单和具体 - 使用一个简单的自定义路由器（低于200 LOC）来代替。
- (WIP) i18n 地区的数据应该按需获取。

## 其他的差异

Vitepress 更为专业和更少的配置：VitePress旨在缩减当前VuePress中的复杂性，并从其极简主义的根源重新开始。

VitePress 面向未来的：VitePress 只支持支持原生 ES 模块导入的浏览器。它建议使用原生的 JavaScript 不转换，和使用 CSS 变量来进行主题设计。

## 未来是否会成为下一个 VuePress？

我们已经有了[vuepress-next](https://github.com/vuepress/vuepress-next), 它会成为 Vuepress 的下一个大版本。它还会比 VuePress v1 有更加多的改进，并且现在也支持 Vite 。

VitePress 不兼容当前 VuePress 社区系统（主题和插件）。总的想法是，VitePress将有一个大幅减少的主题API（倾向于JavaScript API，而不是文件布局惯例），并且可能没有插件（所有定制都在主题中完成）。