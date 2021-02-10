<template>
  <div v-show="!_internal ? true : active">
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

export default defineComponent({
  props: {
    title: {
      type: String,
      required: true
    } as PropType<string>,
    active: {
      type: [Boolean, String],
    },
    _internal: {
      type: Boolean,
      default() {
        return false
      }
    }
  },
  name: "CodeBlock"
})
</script>

<style scoped>

</style>