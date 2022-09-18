# Inline

## appearance
  - Type: `"boolean"`{ts}
  - Type: `Boolean`{ts}
  - Type: `undefined`{ts}
  - Default: `$route.path`{python}
  - Default: `<div></div>`{html}
  - Default: `document.querySelector`{cpp}
  - Default: `String`{ts}

VitePress offers several built in API to let you access app data. VitePress also comes with few built-in component that can be used globally.

The helper methods are globally importable from `vitepress` and are typically used in custom theme Vue components. However, they are also usable inside `.md` pages because markdown files are compiled into Vue single-file components.

Methods that start with `use*` indicates that it is a [Vue 3 Composition API](https://vuejs.org/guide/introduction.html#composition-api) function that can only be used inside `setup()` or `<script setup>`.