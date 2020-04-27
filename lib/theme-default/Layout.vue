<template>
  <div class="theme-container">
    <h1>Hello VitePress {{ a }}</h1>
    <Content/>
  </div>
</template>

<script>
export default {
  data: () => ({ a: 111 })
}
</script>

<style>
.theme-container {
  font-family: Arial, Helvetica, sans-serif;
}
</style>
