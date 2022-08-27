# Code Groups

test

:::code-group

```js [app.vue]
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```

```js{3,4}  [layouts/custom.vue]
<template>
  <div>
    Some *custom* layout
    <slot />
  </div>
</template>
```

```js{1-3,5} [layouts/default.vue]
export default {
  name: 'MyComponent'
  // ...
}
<template>
  <div>
    Some *custom* layout
    <slot />
  </div>
</template>
```

```js
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```

:::


