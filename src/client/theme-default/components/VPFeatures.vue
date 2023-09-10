<script setup lang="ts">
import type { DefaultTheme } from 'vitepress/theme'
import { computed, toRef } from 'vue'
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
  features: (FeatureGroup | Feature)[]
}>()

const normalizedFeatures = computed(() => {
  const isFeatureGroupArray = props.features.every(
    (item) => item.hasOwnProperty('features')
  )

  if (isFeatureGroupArray) {
    return props.features as FeatureGroup[]
  } else {
    const features: FeatureGroup[] = [{
      features: props.features as Feature[]
    }];

    return features
  }
})

const { value: normalizedFeaturesValue } = toRef(normalizedFeatures)

const grid = computed(() => {
  return (idx: number) => {
    const group = normalizedFeaturesValue[idx]
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
})

const { value: gridValue } = toRef(grid)

const firstHeading = computed(() => {
  return (idx: number) => {
    return idx === 0 ? 'first' : ''
  }
})

const { value: firstHeadingValue } = toRef(firstHeading)
</script>

<template>
  <div v-if="features" class="VPFeatures">
    <div
      class="section"
      v-for="(feature_group, feature_group_idx) in normalizedFeaturesValue">
      <h2
        class="feature-group-title"
        :class="[firstHeadingValue(feature_group_idx)]"
        v-if="feature_group.title && feature_group.title.length > 0"
        v-html="feature_group.title" />
      <div class="container">
        <div class="items">
          <div
            v-for="feature in feature_group.features"
            :key="feature.title" class="item"
            :class="[gridValue(feature_group_idx)]">
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