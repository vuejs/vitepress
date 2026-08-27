<script setup lang="ts">
import { useLocalStorage } from '@vueuse/core'

const props = defineProps<{
  options: string[]
  defaultOption: string
  screenMenu?: boolean
  menu?: boolean
}>()

// reactivity isn't needed for props here

const key = removeSpaces(`api-preference-${props.options.join('-')}`)
const name = key + (props.screenMenu ? '-screen-menu' : props.menu ? '-menu' : '')

const selected = useLocalStorage(key, () => props.defaultOption)

const optionsWithKeys = props.options.map((option) => ({
  key: name + '-' + removeSpaces(option),
  value: option
}))

function removeSpaces(str: string) {
  return str.replace(/\s/g, '_')
}
</script>

<template>
  <div
    class="VPApiPreference"
    :class="{ 'screen-menu': screenMenu, 'in-menu': menu }"
  >
    <template v-for="option in optionsWithKeys" :key="option.key">
      <input
        type="radio"
        :id="option.key"
        :name
        :value="option.value"
        v-model="selected"
      />
      <label :for="option.key">{{ option.value }}</label>
    </template>
  </div>
</template>

<style scoped>
.VPApiPreference {
  display: flex;
  margin: 0.75rem 0;
  border: 1px solid var(--vp-c-border);
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: var(--vp-c-text-1);
}

.VPApiPreference:first-child {
  margin-top: 0;
}

.VPApiPreference:last-child {
  margin-bottom: 0;
}

.VPApiPreference.in-menu {
  margin: 0.5rem 0.75rem;
}

.VPApiPreference.screen-menu {
  margin: 0.75rem 0 0 0.75rem;
  font-size: 1rem;
}

.VPApiPreference input[type='radio'] {
  pointer-events: none;
  position: fixed;
  opacity: 0;
}

.VPApiPreference label {
  flex: 1;
  margin: 0.125rem;
  padding: 0.25rem 0.75rem;
  cursor: pointer;
  border-radius: 0.25rem;
  text-align: center;
}

.VPApiPreference input[type='radio']:checked + label {
  background-color: var(--vp-c-default-soft);
  color: var(--vp-c-brand-1);
}
</style>
