<script setup lang="ts">
import { computed, ref } from 'vue'
import { useLangs } from '../composables/langs'
import VPLink from './VPLink.vue'
import VPSocialLink from "./VPSocialLink.vue";

const { localeLinks, currentLang } = useLangs({ correspondingLink: true })
const isOpen = ref(false)
const repo = computed(() => !!currentLang.value.repository || localeLinks.value.some(l => !!l.repository))

function toggle() {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div
    v-if="localeLinks.length && currentLang.label"
    class="VPNavScreenTranslations"
    :class="{ open: isOpen, repo }"
  >
    <button class="title" :class="{ repo: !!currentLang.repository }" @click="toggle">
      <span v-if="currentLang.repository" class="repo">
        <span class="vpi-languages icon lang" />
        <span>{{ currentLang.label }}</span>
        <span class="vpi-chevron-down icon chevron" />
      </span>
      <template v-else>
        <span class="vpi-languages icon lang" />
        <span>{{ currentLang.label }}</span>
        <span class="vpi-chevron-down icon chevron" />
      </template>
      <VPSocialLink
        v-if="currentLang.repository"
        :icon="currentLang.repository.icon ?? 'github'"
        :link="currentLang.repository.link"
        :ariaLabel="currentLang.repository.title"
      />
    </button>

    <ul class="list">
      <li
        v-for="locale in localeLinks"
        :key="locale.link"
        :class="{ repo: !!locale.repository }"
        class="item"
      >
        <VPLink class="link" :href="locale.link">{{ locale.text }}</VPLink>
        <VPSocialLink
          v-if="locale.repository"
          :icon="locale.repository.icon ?? 'github'"
          :link="locale.repository.link"
          :ariaLabel="locale.repository.title"
        />
      </li>
    </ul>
  </div>
</template>

<style scoped>
.VPNavScreenTranslations {
  height: 24px;
  overflow: hidden;
}

.VPNavScreenTranslations.repo {
  height: 40px;
}

.VPNavScreenTranslations.open {
  height: auto;
}

.title, .title.repo .repo {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);

}

.title.repo {
  width: 100%;
  justify-content: space-between;
}


.VPNavScreenTranslations .title .vpi-chevron-down {
  transition: transform 0.25s;
  transform: rotate(90deg);
}
.VPNavScreenTranslations.open .title .vpi-chevron-down {
  transform: rotate(-90deg);
}

.icon {
  font-size: 16px;
}

.icon.lang {
  margin-right: 8px;
}

.icon.chevron {
  margin-left: 4px;
}

.list {
  padding: 4px 0 0 24px;
}

.list .item.repo {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.link {
  line-height: 32px;
  font-size: 13px;
  color: var(--vp-c-text-1);
}
</style>
