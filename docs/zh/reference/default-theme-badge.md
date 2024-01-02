# 徽标 {#badge}

徽标可让你为标题添加状态。例如，指定部分的类型或支持的版本可能很有用。

## 用法 {#usage}

可以使用全局组件 `Badge` 。

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

## 自定义子节点 {#custom-children}

`<Badge>` 接受 `children`，这将显示在徽标中。

```html
### Title <Badge type="info">custom element</Badge>
```

### Title <Badge type="info">custom element</Badge>

## 自定义不同类型徽标的背景色 {#customize-type-color}

可以通过覆盖 css 来自定义不同类型 `<Badge />` 的样式。以下是默认值。

```css
:root {
  --vp-badge-info-border: transparent;
  --vp-badge-info-text: var(--vp-c-text-2);
  --vp-badge-info-bg: var(--vp-c-default-soft);

  --vp-badge-tip-border: transparent;
  --vp-badge-tip-text: var(--vp-c-brand-1);
  --vp-badge-tip-bg: var(--vp-c-brand-soft);

  --vp-badge-warning-border: transparent;
  --vp-badge-warning-text: var(--vp-c-warning-1);
  --vp-badge-warning-bg: var(--vp-c-warning-soft);

  --vp-badge-danger-border: transparent;
  --vp-badge-danger-text: var(--vp-c-danger-1);
  --vp-badge-danger-bg: var(--vp-c-danger-soft);
}
```

## `<Badge>`

`<Badge>` 组件接受以下属性：

```ts
interface Props {
  // 当传递 `<slot>` 时，该值将被忽略
  text?: string

  // 默认为 `tip`.
  type?: 'info' | 'tip' | 'warning' | 'danger'
}
```
