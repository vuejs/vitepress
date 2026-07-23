<script setup lang="ts">
import { computed } from 'vue'
import { useData } from '../composables/data'
import { useEditLink } from '../composables/edit-link'
import { usePrevNext } from '../composables/prev-next'
import VPDocFooterLastUpdated from './VPDocFooterLastUpdated.vue'
import VPLink from './VPLink.vue'

const { theme, page, frontmatter } = useData()

const editLink = useEditLink()
const control = usePrevNext()

const hasEditLink = computed(
  () => theme.value.editLink && frontmatter.value.editLink !== false
)
const hasLastUpdated = computed(() => page.value.lastUpdated)
const showFooter = computed(
  () =>
    hasEditLink.value ||
    hasLastUpdated.value ||
    control.value.prev ||
    control.value.next
)
</script>

<template>
  <footer v-if="showFooter" class="VPDocFooter">
    <slot name="doc-footer-before" />

    <div v-if="hasEditLink || hasLastUpdated" class="edit-info">
      <div v-if="hasEditLink" class="edit-link">
        <VPLink class="edit-link-button" :href="editLink.url" :no-icon="true">
          <span class="vpi-square-pen edit-link-icon" />
          {{ editLink.text }}
        </VPLink>
      </div>

      <div v-if="hasLastUpdated" class="last-updated">
        <VPDocFooterLastUpdated />
      </div>
    </div>

    <nav
      v-if="control.prev?.link || control.next?.link"
      class="prev-next"
      aria-labelledby="doc-footer-aria-label"
    >
      <span class="visually-hidden" id="doc-footer-aria-label">Pager</span>

      <div class="pager">
        <VPLink
          v-if="control.prev?.link"
          class="pager-link prev"
          :href="control.prev.link"
          :target="control.prev.target"
          :rel="control.prev.rel"
        >
          <span
            class="desc"
            v-html="theme.docFooter?.prev || 'Previous page'"
          ></span>
          <span class="title" v-html="control.prev.text"></span>
        </VPLink>
      </div>
      <div class="pager">
        <VPLink
          v-if="control.next?.link"
          class="pager-link next"
          :href="control.next.link"
          :target="control.next.target"
          :rel="control.next.rel"
        >
          <span
            class="desc"
            v-html="theme.docFooter?.next || 'Next page'"
          ></span>
          <span class="title" v-html="control.next.text"></span>
        </VPLink>
      </div>
    </nav>
  </footer>
</template>

<style scoped>
.VPDocFooter {
  margin-top: 4rem;
}

.edit-info {
  padding-bottom: 1.125rem;
}

@media (min-width: 40rem) {
  .edit-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 0.875rem;
  }
}

.edit-link-button {
  display: flex;
  align-items: center;
  border: 0;
  line-height: 2rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--vp-c-brand-1);
  transition: color 0.25s;
}

.edit-link-button:hover {
  color: var(--vp-c-brand-2);
}

.edit-link-icon {
  margin-right: 0.5rem;
}

.prev-next {
  border-top: 1px solid var(--vp-c-divider);
  padding-top: 1.5rem;
  display: grid;
  grid-row-gap: 0.5rem;
}

@media (min-width: 40rem) {
  .prev-next {
    grid-template-columns: repeat(2, 1fr);
    grid-column-gap: 1rem;
  }
}

.pager-link {
  display: block;
  border: 1px solid var(--vp-c-divider);
  border-radius: 0.5rem;
  padding: 0.6875rem 1rem 0.8125rem;
  width: 100%;
  height: 100%;
  transition: border-color 0.25s;
}

.pager-link:hover {
  border-color: var(--vp-c-brand-1);
}

.pager-link.next {
  margin-left: auto;
  text-align: right;
}

.desc {
  display: block;
  line-height: 1.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.title {
  display: block;
  line-height: 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--vp-c-brand-1);
  transition: color 0.25s;
}
</style>
