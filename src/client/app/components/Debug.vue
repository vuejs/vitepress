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
  cursor: pointer;
  top: 0;
  right: 0;
  width: 40px;
  height: 25px;
  padding: 5px;
  overflow: hidden;
  color: #eeeeee;
  margin-top: -15px;
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
}
</style>
