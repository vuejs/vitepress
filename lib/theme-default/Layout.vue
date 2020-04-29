<template>
  <div class="theme-container">
    <h1>{{ $site.title }}</h1>
    <p>{{ $site.description }}</p>
    <Content/>
  </div>
  <div class="debug">
    <pre>$site {{ $site }}</pre>
    <pre>$page {{ $page }}</pre>
    <pre>useSiteData() {{ site }}</pre>
    <pre>usePageData() {{ page }}</pre>
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

.debug {
  position: absolute;
  top: 0;
  right: 0;
  width: 400px;
  color: #fff;
  background-color: rgba(0,0,0,0.85);
  padding: 10px 20px;
}
</style>
