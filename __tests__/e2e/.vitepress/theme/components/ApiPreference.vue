<script setup lang="ts">
import { useLocalStorage } from '@vueuse/core'

const props = defineProps<{
  options: string[]
  defaultOption: string
  screenMenu?: boolean
}>()

// reactivity isn't needed for props here

const key = removeSpaces(`api-preference-${props.options.join('-')}`)
const name = key + (props.screenMenu ? '-screen-menu' : '')

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
  <div class="VPApiPreference" :class="{ 'screen-menu': screenMenu }">
    <template v-for="option in optionsWithKeys" :key="option">
      <input
        type="radio"
        :id="option.key"
        :name="name"
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
  margin: 12px 0;
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  font-size: 14px;
  color: var(--vp-c-text-1);
}

.VPApiPreference:first-child {
  margin-top: 0;
}

.VPApiPreference:last-child {
  margin-bottom: 0;
}

.VPApiPreference.screen-menu {
  margin: 12px 0 0 12px;
}

.VPApiPreference input[type='radio'] {
  pointer-events: none;
  position: fixed;
  opacity: 0;
}

.VPApiPreference label {
  flex: 1;
  margin: 2px;
  padding: 4px 12px;
  cursor: pointer;
  border-radius: 4px;
  text-align: center;
}

.VPApiPreference input[type='radio']:checked + label {
  background-color: var(--vp-c-default-soft);
  color: var(--vp-c-brand-1);
}
</style>
