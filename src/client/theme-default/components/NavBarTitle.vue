<template>
  <a
    class="nav-bar-title"
    :href="$site.base"
    :aria-label="`${$site.title}, back to home`"
  >
    <img
      v-if="$theme.logo"
      class="logo"
      :src="withBase($theme.logo)"
      alt="Logo"
    />
    {{ $site.title }}
  </a>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { withBase } from '../utils'

export default defineComponent({
  setup() {
    return { withBase }
  }
})
</script>

<style scoped>
.nav-bar-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--c-text);
}

.nav-bar-title:hover {
  text-decoration: none;
}

.logo {
  margin-right: .75rem;
  height: 1.3rem;
  vertical-align: bottom;
}
</style>
