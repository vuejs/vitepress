<template>
  <NavBarTitle />

  <div class="flex-grow" />

  <div class="nav">
    <NavBarLinks />
  </div>

  <slot name="search" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import NavBarTitle from './NavBarTitle.vue'
import NavBarLinks from './NavBarLinks.vue'

export default defineComponent({
  components: {
    NavBarTitle,
    NavBarLinks
  }
})
</script>

<style scoped>
.flex-grow {
  flex-grow: 1;
}

.nav {
  display: none;
}

@media (min-width: 720px) {
  .nav {
    display: block;
  }
}
</style>
