# 页脚 {#footer}

配置好 `themeConfig.footer`， VitePress 将在全局页面底部显示页脚。

```ts
export default {
	themeConfig: {
		footer: {
			message: 'Released under the MIT License.',
			copyright: 'Copyright © 2019-present Evan You',
		},
	},
}
```

```ts
export interface Footer {
	// The message shown right before copyright.
	message?: string

	// The actual copyright text.
	copyright?: string
}
```

上面的配置也支持 HTML 字符串。所以，例如，如果你想配置页脚文本有一些链接，你可以调整配置如下：

```ts
export default {
	themeConfig: {
		footer: {
			message: 'Released under the <a href="https://github.com/vuejs/vitepress/blob/main/LICENSE">MIT License</a>.',
			copyright: 'Copyright © 2019-present <a href="https://github.com/yyx990803">Evan You</a>',
		},
	},
}
```

::: warning
Only inline elements can be used in `message` and `copyright` as they are rendered inside a `<p>` element. If you want to add block elements, consider using [`layout-bottom`](../guide/extending-default-theme#layout-slots) slot instead.
:::

请注意，当[侧边栏](./default-theme-sidebar)可见时，不会显示页脚。
