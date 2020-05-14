## Theme

You can develop your custom theme by adding the following files:

`.vitepress/theme/Layout.vue`

```vue
<template>
  <h1>Custom Layout!</h1>
  <Content/><!-- make sure to include markdown outlet -->
</template>
```

`.vitepress/theme/index.js`

```js
import Layout from './Layout.vue'

export default {
  Layout,
  NotFound: () => 'custom 404', // <- this is a Vue 3 functional component
  enhanceApp({ app, router, siteData }) {
    // app is the Vue 3 app instance from createApp()
    // router is VitePress' custom router (see `lib/app/router.js`)
    // siteData is a ref of current site-level metadata.
  }
}
```

Unlike VuePress, the only file with a fixed location in a theme is `index.js` - everything else is imported and exported there like in a normal application.
