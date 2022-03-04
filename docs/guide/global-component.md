# Global Component

VitePress comes with few built-in components that can be used globally. You may use these components in your markdown or your custom theme configuration.

## Content

The `Content` component displays the rendered markdown contents. Useful [when creating your own theme](./theming).

```vue
<template>
  <h1>Custom Layout!</h1>
  <Content />
</template>
```

## ClientOnly

The `ClientOnly` component renderes its slot only at client side.

Because VitePress applications are server-rendered in Node.js when generating static builds, any Vue usage must conform to the universal code requirements. In short, make sure to only access Browser / DOM APIs in `beforeMount` or `mounted` hooks.

If you are using or demoing components that are not SSR-friendly (for example, components that contain [custom directives](https://vuejs.org/guide/reusability/custom-directives.html) that don't implement an [SSR transform](https://github.com/vuejs/core/issues/3298#issuecomment-785607554)), you can wrap them inside the `ClientOnly` component.

```html
<ClientOnly>
  <NonSSRFriendlyComponent />
</ClientOnly>
```

## OutboundLink

The component `OutboundLink` is used to denote external links on the page. In VitePress, this component "follows" every external link. `OutboundLink` is a small component that simply renders an SVG icon after an external link.
