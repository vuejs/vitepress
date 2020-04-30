<template>
  <div class="theme-container">
    <h1>{{ $site.title }}</h1>
    <p>{{ $site.description }}</p>
    <Content/>
  </div>
  <Debug/>
</template>

<script>
import { Debug } from 'vitepress'

export default {
  components: {
    Debug: __DEV__ ? Debug : () => null
  }
}
</script>

<style>
.theme-container {
  font-family: Arial, Helvetica, sans-serif;
}
</style>
