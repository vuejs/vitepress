# Global Component

VitePress comes with few built-in component that can be used globally. You may use these components in your markdown or your custom theme configuration.

## Content

The `Content` component displays the rendered markdown contents. Useful [when creating your own theme](http://localhost:3000/guide/customization.html).

```vue
<template>
  <h1>Custom Layout!</h1>
  <Content />
</template>
```

## ClientOnly

The `ClientOnly` component renderes its slot only at client side.

Because VitePress applications are server-rendered in Node.js when generating static builds, any Vue usage must conform to the universal code requirements. In short, make sure to only access Browser / DOM APIs in beforeMount or mounted hooks.

If you are using or demoing components that are not SSR-friendly (for example, contain custom directives), you can wrap them inside the `ClientOnly` component.

```html
<ClientOnly>
  <NonSSRFriendlyComponent />
</ClientOnly>
```
