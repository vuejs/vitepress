<script setup lang="ts">
import type { DefaultTheme } from 'vitepress/theme'
import { computed } from 'vue'
import VPFeature from './VPFeature.vue'

export interface FeatureGroup {
  title?: string,
  features: Feature[]
}

export interface Feature {
  icon?: DefaultTheme.FeatureIcon
  title: string
  details: string
  link?: string
  linkText?: string
  rel?: string
}

const props = defineProps<{
  features: FeatureGroup[]
}>()

const grid = computed({
  get() {
    return (idx: number) => {
      const group = props.features[idx]
      if (!group) return ''
      const length = group.features.length
      if (!length) {
        return
      } else if (length === 2) {
        return 'grid-2'
      } else if (length === 3) {
        return 'grid-3'
      } else if (length % 3 === 0) {
        return 'grid-6'
      } else if (length > 3) {
        return 'grid-4'
      }
    }
  }
})

const firstHeading = computed({
  get() {
    return (idx: number) => {
      return idx === 0 ? 'first' : ''
    }
  }
})
</script>

<template>
  <div v-if="features" class="VPFeatures">
    <div class="section" v-for="(feature_group, feature_group_idx) in features">
      <h2 
        class="feature-group-title"
        :class="[firstHeading(feature_group_idx)]"
        v-if="feature_group.title"
        v-html="feature_group.title" />
      <div class="container">
        <div class="items">
          <div
            v-for="feature in feature_group.features"
            :key="feature.title"
            class="item"
            :class="[grid(feature_group_idx)]"
          >
            <VPFeature
              :icon="feature.icon"
              :title="feature.title"
              :details="feature.details"
              :link="feature.link"
              :link-text="feature.linkText"
              :rel="feature.rel"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.VPFeatures {
  position: relative;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

@media (min-width: 640px) {
  .VPFeatures {
    padding: 0 48px;
  }
}

@media (min-width: 960px) {
  .VPFeatures {
    padding: 0 64px;
  }
}

h2.feature-group-title {
  margin-top: 16px;
  margin-bottom: 16px;
  font-size: 24px;
  font-weight: 600;
}

h2.feature-group-title.first {
  margin-top: 0;
}

.section {
  margin: 0 auto;
  width: 100%;
  max-width: 1152px;
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
