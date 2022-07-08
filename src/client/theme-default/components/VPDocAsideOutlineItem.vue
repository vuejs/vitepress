<script setup lang="ts">
import {
  MenuItemWithLinkAndChildren
} from '../composables/outline'


const props = defineProps<{
  headers: MenuItemWithLinkAndChildren[]
  onClick: (e: MouseEvent) => void
  isRoot?: boolean
}>()

</script>

<template>
  <ul :class="isRoot ? 'root' : 'nested'">
    <li v-for="{ children, hidden, link, text } in headers" v-show="!hidden">
      <a class="outline-link" :href="link" @click="props.onClick">
        {{ text }}
      </a>
      <template v-if="!!children?.length">
        <VPDocAsideOutlineItem :headers="children" :isRoot="false" :onClick="props.onClick" />
      </template>
    </li>
  </ul>
</template>

<style scoped>
.root {
  position: relative;
  z-index: 1;
}

.nested {
  padding-left: 13px;
}

.outline-link {
  display: block;
  line-height: 28px;
  color: var(--vp-c-text-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.5s;
}

.outline-link:hover,
.outline-link.active {
  color: var(--vp-c-text-1);
  transition: color 0.25s;
}

.outline-link.nested {
  padding-left: 13px;
}
</style>
