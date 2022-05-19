<script setup lang="ts">
import { useData } from 'vitepress'
import { normalizeLink } from '../support/utils'
import { useEditLink } from '../composables/edit-link'
import { usePrevNext } from '../composables/prev-next'
import VPIconEdit from './icons/VPIconEdit.vue'
import VPLink from './VPLink.vue'

const { theme, frontmatter } = useData()

const editLink = useEditLink()
const control = usePrevNext()
</script>

<template>
  <footer v-if="control.prev || control.next" class="VPDocFooter">
    <div v-if="theme.editLink && frontmatter.editLink !== false" class="edit-link">
      <VPLink class="edit-link-button" :href="editLink.url" :no-icon="true">
        <VPIconEdit class="edit-link-icon" />
        {{ editLink.text }}
      </VPLink>
    </div>

    <div class="prev-next">
      <div class="pager">
        <a v-if="control.prev" class="pager-link prev" :href="normalizeLink(control.prev.link)">
          <span class="desc">Previous page</span>
          <span class="title">{{ control.prev.text }} </span>
        </a>
      </div>
      <div class="pager" :class="{ 'has-prev': control.prev }">
        <a v-if="control.next"  class="pager-link next" :href="normalizeLink(control.next.link)">
          <span class="desc">Next page</span>
          <span class="title">{{ control.next.text }}</span>
        </a>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.VPDocFooter {
  margin-top: 64px;
}

.edit-link {
  padding-bottom: 8px;
}

.edit-link-button {
  display: flex;
  align-items: center;
  border: 0;
  padding: 10px 0;
  line-height: 20px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-brand);
  transition: color 0.25s;
}

.edit-link-button:hover {
  color: var(--vp-c-brand-dark);
}

.edit-link-icon {
  margin-right: 8px;
  width: 14px;
  height: 14px;
  fill: currentColor;
}

.prev-next {
  border-top: 1px solid var(--vp-c-divider-light);
  padding-top: 24px;
}

@media (min-width: 640px) {
  .prev-next {
    display: flex;
  }
}

.pager.has-prev {
  padding-top: 8px;
}

@media (min-width: 640px) {
  .pager {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    width: 50%;
  }

  .pager.has-prev {
    padding-top: 0;
    padding-left: 16px;
  }
}

.pager-link {
  display: block;
  border: 1px solid var(--vp-c-divider-light);
  border-radius: 8px;
  padding: 11px 16px 13px;
  width: 100%;
  height: 100%;
  transition: border-color 0.25s;
}

.pager-link:hover {
  border-color: var(--vp-c-brand);
}

.pager-link:hover .title {
  color: var(--vp-c-brand-dark);
}

.pager-link.next {
  margin-left: auto;
  text-align: right;
}

.desc {
  display: block;
  line-height: 20px;
  font-size: 12px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.title {
  display: block;
  line-height: 20px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-brand);
  transition: color 0.25s;
}
</style>
