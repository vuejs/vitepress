<script setup lang="ts">
import { ref, watch, reactive } from 'vue'
import { useData } from '../data'

const data = useData()
const el = ref<HTMLElement | null>(null)
const open = ref(false)

// FIXME: remove in next Vue release
const tempData = reactive(data)

watch(open, (value) => {
  if (!value) {
    el.value!.scrollTop = 0
  }
})
</script>

<template>
  <div class="debug" :class="{ open }" ref="el" @click="open = !open">
    <p class="title">Debug</p>
    <pre class="block">{{ tempData }}</pre>
  </div>
</template>

<style scoped>
.debug {
  box-sizing: border-box;
  position: fixed;
  right: .5rem;
  bottom: .5rem;
  z-index: 9999;
  border-radius: 4px;
  width: 4.625rem;
  height: 32px;
  color: #eeeeee;
  overflow: hidden;
  cursor: pointer;
  background-color: rgba(0, 0, 0, 0.85);
  transition: all 0.15s ease;
}

.debug:hover {
  background-color: rgba(0, 0, 0, 0.75);
}

.debug.open {
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  margin-top: 0;
  border-radius: 0;
  padding: 0 0;
  overflow: scroll;
}

@media (min-width: 512px) {
  .debug.open {
    width: 32rem;
  }
}

.debug.open:hover {
  background-color: rgba(0, 0, 0, 0.85);
}

.title {
  margin: 0;
  padding: .375rem 1rem .375rem;
  line-height: 1.25rem;
  font-size: .8125rem;
}

.block {
  margin: .125rem 0 0;
  border-top: .0625rem solid rgba(255, 255, 255, 0.16);
  padding: .5rem 1rem;
  font-family: Hack, monospace;
  font-size: .8125rem;
}

.block + .block {
  margin-top: .5rem;
}
</style>
