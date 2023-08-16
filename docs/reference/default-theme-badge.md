# Badge

The badge lets you add status to your headers. For example, it could be useful to specify the section's type, or supported version.

## Usage

You may use the `Badge` component which is globally available.

```html
### Title <Badge type="info" text="default" />
### Title <Badge type="tip" text="^1.9.0" />
### Title <Badge type="warning" text="beta" />
### Title <Badge type="danger" text="caution" />
```

Code above renders like:

### Title <Badge type="info" text="default" />
### Title <Badge type="tip" text="^1.9.0" />
### Title <Badge type="warning" text="beta" />
### Title <Badge type="danger" text="caution" />

## Custom Children

`<Badge>` accept `children`, which will be displayed in the badge.

```html
### Title <Badge type="info">custom element</Badge>
```

### Title <Badge type="info">custom element</Badge>

## Customize Type Color

You can customize the style of badges by overriding css variables. The following are the default values:

```css
:root {
  --vp-badge-info-border: var(--vp-c-mute-2);
  --vp-badge-info-text: var(--vp-c-text-2);
  --vp-badge-info-bg: var(--vp-c-mute-3);

  --vp-badge-tip-border: var(--vp-c-brand-1);
  --vp-badge-tip-text: var(--vp-c-brand-1);
  --vp-badge-tip-bg: var(--vp-c-brand-dimm-1);

  --vp-badge-warning-border: var(--vp-c-yellow-2);
  --vp-badge-warning-text: var(--vp-c-yellow-1);
  --vp-badge-warning-bg: var(--vp-c-yellow-dimm-1);

  --vp-badge-danger-border: var(--vp-c-red-2);
  --vp-badge-danger-text: var(--vp-c-red-1);
  --vp-badge-danger-bg: var(--vp-c-red-dimm-1);
}
```

## `<Badge>`

`<Badge>` component accepts following props:

```ts
interface Props {
  // When `<slot>` is passed, this value gets ignored.
  text?: string

  // Defaults to `tip`.
  type?: 'info' | 'tip' | 'warning' | 'danger'
}
```
