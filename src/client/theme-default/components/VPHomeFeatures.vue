<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import VPBox from './VPBox.vue'

const { frontmatter: fm } = useData()

const grid = computed(() => {
  const length = fm.value.features?.length

  if (!length) {
    return
  }

  if (length === 2) {
    return 'grid-2'
  } else if (length === 3) {
    return 'grid-3'
  } else if (length % 3 === 0) {
    return 'grid-6'
  } else if (length % 2 === 0) {
    return 'grid-4'
  }
})
</script>

<template>
  <div v-if="fm.features" class="VPHomeFeatures">
    <div class="container">
      <div class="items">
        <div v-for="feature in fm.features" :key="feature.title" class="item" :class="[grid]">
          <VPBox
            :icon="feature.icon"
            :title="feature.title"
            :details="feature.details"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.VPHomeFeatures {
  position: relative;
  padding: 0 24px;
}

@media (min-width: 640px) {
  .VPHomeFeatures {
    padding: 0 48px;
  }
}

.container {
  margin: 0 auto;
  max-width: 960px;
}

.items {
  display: flex;
  flex-wrap: wrap;
  margin: -8px;
}

.item {
  padding: 8px;
  width: 100%;
}

@media (min-width: 640px) {
  .item.grid-2,
  .item.grid-4,
  .item.grid-6 {
    width: calc(100% / 2);
  }
}

@media (min-width: 768px) {
  .item.grid-2,
  .item.grid-4 {
    width: calc(100% / 2);
  }

  .item.grid-3,
  .item.grid-6 {
    width: calc(100% / 3);
  }
}

@media (min-width: 960px) {
  .item.grid-4 {
    width: calc(100% / 4);
  }
}

</style>
