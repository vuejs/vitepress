# 标记 {#badge}

徽标可让你为标题添加状态。例如，指定部分的类型或支持的版本可能很有用。

## 用法 {#usage}

你可以使用全局组件 `Badge` 。

```html
### Title <Badge type="info" text="default" /> 
### Title <Badge type="tip" text="^1.9.0" /> 
### Title <Badge type="warning" text="beta" />
### Title <Badge type="danger" text="caution" />
```

上面的代码渲染如下：

### Title <Badge type="info" text="default" /> 
### Title <Badge type="tip" text="^1.9.0" /> 
### Title <Badge type="warning" text="beta" /> 
### Title <Badge type="danger" text="caution" />

## 自定义 `children` {#custom-children}

`<Badge>` 接受 `子节点`, 这将显示在徽标中。

```html
### Title <Badge type="info">custom element</Badge> 
```

### Title <Badge type="info">custom element</Badge>

## 自定义不同类型徽标的背景色 {#customize-type-color}

你可以通过覆盖 css 变量 `background-color` 来自定义不同类型 `<Badge />` 的背景色。以下是默认值。

```css
:root {
  --vp-badge-info-border: var(--vp-c-divider-light);
  --vp-badge-info-text: var(--vp-c-text-2);
  --vp-badge-info-bg: var(--vp-c-white-soft);

  --vp-badge-tip-border: var(--vp-c-green-dimm-1);
  --vp-badge-tip-text: var(--vp-c-green-darker);
  --vp-badge-tip-bg: var(--vp-c-green-dimm-3);

  --vp-badge-warning-border: var(--vp-c-yellow-dimm-1);
  --vp-badge-warning-text: var(--vp-c-yellow-darker);
  --vp-badge-warning-bg: var(--vp-c-yellow-dimm-3);

  --vp-badge-danger-border: var(--vp-c-red-dimm-1);
  --vp-badge-danger-text: var(--vp-c-red-darker);
  --vp-badge-danger-bg: var(--vp-c-red-dimm-3);
}

.dark {
  --vp-badge-info-border: var(--vp-c-divider-light);
  --vp-badge-info-bg: var(--vp-c-black-mute);

  --vp-badge-tip-border: var(--vp-c-green-dimm-2);
  --vp-badge-tip-text: var(--vp-c-green-light);

  --vp-badge-warning-border: var(--vp-c-yellow-dimm-2);
  --vp-badge-warning-text: var(--vp-c-yellow-light);

  --vp-badge-danger-border: var(--vp-c-red-dimm-2);
  --vp-badge-danger-text: var(--vp-c-red-light);
}
```

## `<Badge>`

`<Badge>` 组件接受以下属性：

```ts
interface Props {
  // When `<slot>` is passed, this value gets ignored.
  text?: string

  // Defaults to `tip`.
  type?: 'info' | 'tip' | 'warning' | 'danger'
}
```
