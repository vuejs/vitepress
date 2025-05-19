# MPA 模式 <Badge type="warning" text="experimental" /> {#mpa-mode}

可以通过命令行输入 `vitepress build --mpa` 或在配置文件中指定 `mpa: true` 配置选项来启用 MPA (Multi-Page Application) 模式。

在 MPA 模式下，所有页面都默认不会包含任何 JavaScript。因此，站点也许可以在评估工具中获得更好的初始访问性能分数。

但是，由于缺少 SPA 路由，在 MPA 模式下切换页面时会重新加载整个页面，而不会像 SPA 模式那样立即响应。

同时请注意，默认情况下不使用 JavaScript 意味着你实际上只是将 Vue 作为服务器端模板语言。浏览器不会附加任何事件处理程序，因此将不会有任何交互性。要加载客户端 JavaScript，需要使用特殊的 `<script client>` 标签：

```html
<script client>
document.querySelector('h1').addEventListener('click', () => {
  console.log('client side JavaScript!')
})
</script>

# Hello
```

`<script client>` 是 VitePress 独有的功能，而不是 Vue 的功能。它可以在 `.md` 和 `.vue` 文件中使用，但只能在 MPA 模式下使用。所有主题组件中的客户端脚本将被打包在一起，而特定页面的客户端脚本将会分开处理。

请注意，`<script client>` **不会被视为 Vue 组件代码**，它只是普通的 JavaScript 模块。因此，只有在站点需要极少的客户端交互时，才应该使用 MPA 模式。
