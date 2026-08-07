<script setup lang="ts">
  import { ref } from 'vue'

  const props = defineProps<{
    command: string
  }>()

  const copied = ref(false)

  async function copy () {
    try {
      await navigator.clipboard.writeText(props.command)
      copied.value = true
      setTimeout(() => {
        copied.value = false
      }, 2000)
    } catch (error) {
      console.error('Failed to copy', error)
    }
  }
</script>

<template>
  <div
    class="hero-copy-btn"
    :class="{ copied }"
    role="button"
    tabindex="0"
    @click="copy"
    @keydown.enter="copy"
    @keydown.space.prevent="copy"
  >
    <div class="content">
      <span class="prompt">$</span>
      <span class="command">{{ command }}</span>
    </div>
    <div class="icon-wrapper">
      <transition mode="out-in" name="fade">
        <svg
          v-if="!copied"
          class="lucide lucide-copy"
          fill="none"
          height="18"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          viewBox="0 0 24 24"
          width="18"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            height="14"
            rx="2"
            ry="2"
            width="14"
            x="8"
            y="8"
          />
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
        </svg>
        <svg
          v-else
          class="lucide lucide-check"
          fill="none"
          height="18"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          viewBox="0 0 24 24"
          width="18"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </transition>
    </div>
    <transition name="slide-up">
      <div v-if="copied" class="tooltip">Copied!</div>
    </transition>
  </div>
</template>

<style scoped>
.hero-copy-btn {
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 0 16px;
  height: 48px;
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
  user-select: none;
  max-width: calc(100vw - 2 * 24px);
  width: 100%;
}

.hero-copy-btn:hover {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-bg-mute);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.hero-copy-btn:active {
  transform: translateY(0);
}

.hero-copy-btn.copied {
  border-color: var(--vp-c-green-1);
  background: var(--vp-c-green-dimm-1);
}

.content {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--vp-font-family-mono);
  font-size: 14px;
  color: var(--vp-c-text-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.prompt {
  color: var(--vp-c-text-3);
  user-select: none;
  font-weight: 600;
}

.command {
  color: var(--vp-c-text-1);
  font-weight: 500;
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--vp-c-text-3);
  transition: color 0.2s;
  flex-shrink: 0;
}

.hero-copy-btn:hover .icon-wrapper {
  color: var(--vp-c-text-1);
}

.hero-copy-btn.copied .icon-wrapper {
  color: var(--vp-c-green-1);
}

.tooltip {
  position: absolute;
  top: -36px;
  right: 0;
  background: var(--vp-c-text-1);
  color: var(--vp-c-bg);
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  pointer-events: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 10;
}

/* Tooltip arrow */
.tooltip::after {
  content: '';
  position: absolute;
  bottom: -4px;
  right: 12px;
  width: 8px;
  height: 8px;
  background: var(--vp-c-text-1);
  transform: rotate(45deg);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
