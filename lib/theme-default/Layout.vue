<template>
  <div class="theme-container">
    <img src="./vitepress.png" :alt="$site.title" />
    <h2>{{ $site.description }}</h2>
    <Content />
  </div>
  <Debug />
</template>

<style>
.theme-container {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  color: #333;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: auto;

  min-height: 100vh;
}

h2 {
  margin-top: 10px;
  color: #6c7695;
  font-weight: 300;
}

img {
  height: 120px;
}
</style>
