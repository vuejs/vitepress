<template>
  <div class="buy-sell-ads">
    <div class="bsa-cpc" />
  </div>
</template>

<script setup lang="ts">
import { defineProps, onMounted } from 'vue'

// global _bsa
const ID = 'bsa-cpc-script'

declare global {
  var _bsa: BSA | undefined

  interface BSA {
    init(
      name: string,
      code: string,
      placement: string,
      options: {
        target: string
        align: string
        disable_css?: 'true' | 'false'
      }
    ): void
  }
}

const { code, placement } = defineProps<{
  code: string
  placement: string
}>()

onMounted(() => {
  if (!document.getElementById(ID)) {
    const s = document.createElement('script')

    s.id = ID
    s.src = '//m.servedby-buysellads.com/monetization.js'

    document.head.appendChild(s)

    s.onload = () => {
      load()
    }
  } else {
    load()
  }
})

function load() {
  if (typeof _bsa !== 'undefined' && _bsa) {
    _bsa.init('default', code, `placement:${placement}`, {
      target: '.bsa-cpc',
      align: 'horizontal',
      disable_css: 'true'
    })
  }
}
</script>

<style scoped>
.buy-sell-ads {
  margin: 0 auto;
  padding-top: 2rem;
  font-size: 0.85rem;
}

.bsa-cpc {
  border-radius: 6px;
  background-color: var(--c-bg-accent);
}

.bsa-cpc ::v-deep(a._default_) {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  margin-bottom: 20px;
  padding: 12px;
  text-decoration: none;
  line-height: 1.4;
  font-weight: 400;
  color: var(--c-text-light);
}

@media (min-width: 512px) {
  .bsa-cpc ::v-deep(a._default_) {
    flex-wrap: nowrap;
  }
}

.bsa-cpc ::v-deep(.default-ad) {
  display: none;
}

.bsa-cpc ::v-deep(a._default_ .default-image) {
  flex-shrink: 0;
  margin-right: 12px;
  width: 24px;
}

.bsa-cpc ::v-deep(a._default_ .default-image img) {
  border-radius: 4px;
  height: 24px;
  vertical-align: middle;
}

.bsa-cpc ::v-deep(._default_::after) {
  border: 1px solid #1c90f3;
  border-radius: 4px;
  margin-top: 8px;
  margin-left: 36px;
  padding: 0 8px;
  line-height: 22px;
  font-size: 0.85em;
  font-weight: 500;
  color: #1c90f3;
  content: 'Sponsored';
}

@media (min-width: 512px) {
  .bsa-cpc ::v-deep(._default_::after) {
    margin-top: 0px;
    margin-left: 12px;
  }
}

.bsa-cpc ::v-deep(.default-text) {
  flex-grow: 1;
  align-self: center;
  width: calc(100% - 36px);
}

@media (min-width: 512px) {
  .bsa-cpc ::v-deep(.default-text) {
    width: auto;
  }
}

.bsa-cpc ::v-deep(.default-title) {
  font-weight: 600;
}

.bsa-cpc ::v-deep(.default-description) {
  padding-left: 8px;
}
</style>
