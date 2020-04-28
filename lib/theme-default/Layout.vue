<template>
  <div class="theme-container">
    <h1>Hello VitePress</h1>
    <pre>$site {{ $site }}</pre>
    <pre>$page {{ $page }}</pre>
    <pre>useSiteData() {{ site }}</pre>
    <pre>usePageData() {{ page }}</pre>
    <Content/>
  </div>
</template>

<script>
import { useSiteData, usePageData } from 'vitepress'

export default {
  setup() {
    return {
      site: useSiteData(),
      page: usePageData()
    }
  }
}
</script>

<style>
.theme-container {
  font-family: Arial, Helvetica, sans-serif;
}
</style>
