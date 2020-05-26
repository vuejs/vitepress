<template>
  <div class="debug" :class="{ open }" @click="open = !open">
    <pre>debug</pre>
    <pre>$site {{ $site }}</pre>
    <pre>$page {{ $page }}</pre>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  setup() {
    const open = ref(false)
    return {
      open
    }
  }
}
</script>

<style>
.debug {
  position: fixed;
  z-index: 999;
  cursor: pointer;
  bottom: 0;
  right: 0;
  width: 50px;
  height: 20px;
  padding: 5px;
  overflow: hidden;
  color: #eeeeee;
  transition: all .15s ease;
  background-color: rgba(0,0,0,0.85);
}

.debug.open {
  width: 500px;
  height: 100%;
  margin-top: 0;
  padding: 5px 20px;
  overflow: scroll;
}

.debug pre {
  font-family: Hack, monospace;
  font-size: 13px;
  margin: 0;
}
</style>
