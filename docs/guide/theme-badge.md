# Badge

The badge is like the one with same name in [vuepress](https://vuepress.vuejs.org/guide/using-vue.html#built-in-components), but for vitepress.

## Usage

You can use this component in a header to add some status for an API

```js
### Title <Badge text="info" type="info" />
### Title <Badge text="tip" type="tip" />
### Title <Badge text="warning" type="warning" />
### Title <Badge text="error" type="error" />
```

Code above renders like:

### Title <Badge text="info" type="info" />
### Title <Badge text="tip" type="tip" />
### Title <Badge text="warning" type="warning" />
### Title <Badge text="error" type="error" />

## Custom Children

`<Badge>` accept `children`, which will be displayed in the badge.

Give Code like this:

```js
<script setup>
import { Badge } from 'vitepress/theme'
</script>

### Title <Badge type="info"><span>custom element</span></Badge>
```

You will see

### Title <Badge type="info"><span>custom element</span></Badge>

## `<Badge>`

`<Badge />` accept props:

- `text`: string
- `type`: string, optional value: `"tip" | "info" | "warning"| "error"`, defaults to `"tip"`.
- `vertical`: string, optional value: `"top"| "middle"`, defaults to `"top"`.

**P.S** `props.text` would not be used if children given,  Actually, the `props.text` is passed as default slot children.

## Customize Type Color

The background color of `<Badge />` is determined by css vars.

```jsx
/* background-color by var(--vp-c-badge-type-warning); */
<Badge type="warning" />

/* background-color by var(--vp-c-badge-type-tip); */
<Badge type="tip" />

/* background-color by var(--vp-c-badge-type-error); */
<Badge type="error" />

/* background-color by var(--vp-c-badge-type-info); */
<Badge type="info" />
```

you can customize `background-color` of typed `<Badge />` by override css vars.

```css
:root {
    --vp-c-badge-type-error: red;
}
```