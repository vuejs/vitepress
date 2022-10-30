# Code Groups

::: code-group

```txt-vue{1}
{{ 1 + 1 }}
```

```js [app.vue]
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```

<!-- kkk -->

```vue-html{3,4} [layouts/custom.vue]
<template>
  <div>
    Some *custom* layout
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur imperdiet mi in nunc faucibus consequat.
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

:::

- in list

- ::: code-group

  ```js
  printf('111')
  ```

  ```python
  import torch as th
  print("Hello world")
  ```

  ```
  import torch as th
  print("Hello world")
  ```

  :::

```
.
├─ index.md
├─ foo
│  ├─ index.md
│  ├─ one.md
│  └─ two.md
└─ bar
   ├─ index.md
   ├─ three.md
   └─ four.md
```

- ```md{1-3,5}
  [Home](/) <!-- sends the user to the root index.md -->
  [foo](/foo/) <!-- sends the user to index.html of directory foo -->
  [foo heading](./#heading) <!-- anchors user to a heading in the foo index file -->
  [bar - three](../bar/three) <!-- you can omit extention -->
  [bar - three](../bar/three.md) <!-- you can append .md -->
  [bar - four](../bar/four.html) <!-- or you can append .html -->
  ```
