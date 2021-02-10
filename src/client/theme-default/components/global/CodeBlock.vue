<template>
  <div v-show="!_internal ? true : active">
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"

export default defineComponent({
  name: "CodeBlock",
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
  }
})
</script>
