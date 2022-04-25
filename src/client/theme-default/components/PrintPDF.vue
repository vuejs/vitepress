<script setup lang="ts">
import Print from "./icons/Print.vue";

function printPDF() {
  window.print()
}

</script>

<template>
  <button @click="printPDF" type="button" title="Print PDF" aria-label="Print PDF" class="print">
    <Print class="icon" />
  </button>
</template>

<style scoped>
.print{
  border: 0;
  background-color: var(--c-white);
  color: var(--c-text-light-2);
  margin-left: 0.8em;
  width: 2.6em;
  height: 2.6em;
  display: none;
}
.print:hover{
  color: var(--vt-c-text-1);
  transition: color .25s;
}

@media (min-width: 720px) {
  .print {
    display: block;
  }
}
</style>
