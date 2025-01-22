<script setup lang="ts">
import {
  defineAsyncComponent,
  ref
} from 'vue'
import { useData } from './composables/data'
const { theme, site } = useData()

const VPLocalSearchBox = __VP_LOCAL_SEARCH__
  ? defineAsyncComponent(() => import('./components/VPLocalSearchBox.vue'))
  : () => null

const VPAlgoliaSearchBox = __ALGOLIA__
  ? defineAsyncComponent(() => import('./components/VPAlgoliaSearchBox.vue'))
  : () => null

const provider = __ALGOLIA__ ? 'algolia' : __VP_LOCAL_SEARCH__ ? 'local' : ''

const filterText = ref('');
const handleFilterTextChange = (text: string) => {
  filterText.value = text;
  const newUrl = (new URL(window.location.href));
  if (text) {
    newUrl.searchParams.set('q', text)
  } else {
    newUrl.searchParams.delete('q');
  }
  history.replaceState({}, '', newUrl.href)
}

const title = site.value.title;
</script>

<template>
  <div class="Search">
    
    <div class="search-wrapper">
        <h1 class="title">{{ filterText ? `Search Results For "${filterText}"` : `Search ${title}` }}</h1>

        <template v-if="provider === 'local'">
            <VPLocalSearchBox @filter-change="handleFilterTextChange"/>
        </template>

        <template v-else-if="provider === 'algolia'">
            <VPAlgoliaSearchBox
                :algolia="theme.search?.options ?? theme.algolia"
            />
        </template>
    </div>

  </div>
</template>

<style scoped>
  .search-wrapper {
    position: relative;
    padding: 12px;
    margin: 32px auto 0;
    width: min(100vw - 60px, 900px);
  }
  .title {
    margin-bottom: 12px;
    letter-spacing: -0.02em;
    line-height: 40px;
    font-size: 32px;
    font-weight: 600;
    outline: none;
  }
</style>
