<script setup lang="ts">
defineProps<{
  title: string
  check: boolean
}>()
</script>

<template>
  <svg xmlns="http://www.w3.org/2000/svg"
       role="img"
       aria-labelledby="smooth-scroll-icon-on"
       focusable="false"
       class="smooth-scroll-icon-on"
       width="32"
       height="32"
       preserveAspectRatio="xMidYMid meet"
       viewBox="0 0 24 24">
    <title id="smooth-scroll-icon-on">
      {{ title }}
    </title>
    <path v-if="check" d="m9 20.42l-6.21-6.21l2.83-2.83L9 14.77l9.88-9.89l2.83 2.83L9 20.42Z"></path>
    <path
        v-else
        d="m12.748 4.002l-.001.002h7.498c.967 0 1.75.784 1.75 1.75V18.25a1.75 1.75 0 0 1-1.75 1.75h-8.997l-.001-.002H3.75A1.75 1.75 0 0 1 2 18.247V5.752c0-.967.784-1.75 1.75-1.75h8.998Zm7.497 1.502h-7.497V18.5h7.497a.25.25 0 0 0 .25-.25V5.755a.25.25 0 0 0-.25-.25Zm-8.997-.002H3.75a.25.25 0 0 0-.25.25v12.495c0 .138.112.25.25.25h7.498V5.502Zm3.454 7.9l.083.073l1.718 1.75l1.714-1.75a.75.75 0 0 1 1.143.966l-.071.085l-2.25 2.296a.75.75 0 0 1-.987.074l-.084-.074l-2.253-2.296a.75.75 0 0 1 .987-1.124Zm2.337-6.176l2.25 2.296a.75.75 0 0 1-1.072 1.05l-1.714-1.75l-1.718 1.75a.75.75 0 1 1-1.07-1.05l2.253-2.297a.75.75 0 0 1 1.07 0Z"></path>
  </svg>
</template>

<style scoped>
svg.smooth-scroll-icon-on {
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
}
</style>
