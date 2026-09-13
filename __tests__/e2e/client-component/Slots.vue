<script lang="ts">
if (typeof window === 'undefined') {
  throw new Error('This component can only be imported in the browser')
}
</script>

<script setup lang="ts">
defineProps<{ message?: string }>()
</script>

<template>
  <section class="client-component">
    <header>
      <slot name="header" :message="message || 'scoped value'">
        header fallback
      </slot>
    </header>
    <div class="default-slot"><slot>default fallback</slot></div>
    <footer><slot name="footer" /></footer>
  </section>
</template>
