<template>
  <div class="theme-container">
    <h1>Hello VitePress</h1>
    <pre>{{ $site }}</pre>
    <pre>{{ $page }}</pre>
    <pre>{{ site }}</pre>
    <pre>{{ page }}</pre>
    <Content/>
  </div>
</template>

<script>
import { useSiteData, usePageData } from 'vitepress'

export default {
  data: () => ({
    site: useSiteData(),
    page: usePageData()
  })
}
</script>

<style>
.theme-container {
  font-family: Arial, Helvetica, sans-serif;
}
</style>
