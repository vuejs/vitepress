<script lang="ts" setup>
import type { ButtonTranslations } from '../../../../types/local-search'
import { createSearchTranslate } from '../support/translation'

// Button-Translations
const defaultTranslations: { button: ButtonTranslations } = {
  button: {
    buttonText: 'Search',
    buttonAriaLabel: 'Search'
  }
}

const translate = createSearchTranslate(defaultTranslations)
</script>

<template>
  <button type="button" class="DocSearch DocSearch-Button" :aria-label="translate('button.buttonAriaLabel')">
    <span class="DocSearch-Button-Container">
      <span class="vp-icon DocSearch-Search-Icon"></span>
      <span class="DocSearch-Button-Placeholder">{{ translate('button.buttonText') }}</span>
    </span>
    <span class="DocSearch-Button-Keys">
      <kbd class="DocSearch-Button-Key"></kbd>
      <kbd class="DocSearch-Button-Key">K</kbd>
    </span>
  </button>
</template>

<style>
[class*='DocSearch'] {
  --docsearch-primary-color: var(--vp-c-brand-1);
  --docsearch-highlight-color: var(--docsearch-primary-color);
  --docsearch-hit-highlight-color: var(--vp-c-brand-soft);
  --docsearch-text-color: var(--vp-c-text-1);
  --docsearch-secondary-text-color: var(--vp-c-text-2);
  --docsearch-muted-color: var(--vp-c-text-2);
  --docsearch-searchbox-shadow: none;
  --docsearch-searchbox-background: transparent;
  --docsearch-background-color: var(--vp-c-bg-soft);
  --docsearch-searchbox-focus-background: transparent;
  --docsearch-key-gradient: transparent;
  --docsearch-key-shadow: none;
  --docsearch-modal-background: var(--vp-c-bg-soft);
  --docsearch-footer-background: var(--vp-c-bg);
  --docsearch-key-background: var(--vp-c-bg-soft);
}

.dark [class*='DocSearch'] {
  --docsearch-modal-shadow: none;
  --docsearch-footer-shadow: none;
  --docsearch-logo-color: var(--vp-c-text-2);
  --docsearch-hit-background: var(--vp-c-default-soft);
  --docsearch-hit-color: var(--vp-c-text-2);
  --docsearch-key-background: var(--vp-c-bg-soft);
  --docsearch-hit-shadow: none;
}

.DocSearch-Button {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0;
  padding: 0;
  width: 48px;
  height: 55px;
  background: transparent;
  transition: border-color 0.25s;
}

.DocSearch-Close {
  background: var(--docsearch-modal-background);
  border-radius: 5px !important;
  border: 0.5px solid var(--vp-c-brand-soft);
  color: var(--vp-c-brand);
}

.DocSearch-Button:hover {
  background: transparent;
}

.DocSearch-Button:focus {
  outline: 1px dotted;
  outline: 5px auto -webkit-focus-ring-color;
}

.DocSearch-Button-Key--pressed {
  transform: none;
  box-shadow: none;
}

.DocSearch-Button:focus:not(:focus-visible) {
  outline: none !important;
}

@media (min-width: 768px) {
  .DocSearch-Button {
    justify-content: space-between;
    border: 1px solid transparent;
    border-radius: 8px;
    padding: 0 10px 0 12px;
    width: 100%;
    height: 40px;
    background-color: var(--vp-c-bg-alt);
  }

  .DocSearch-Button:hover {
    border-color: var(--vp-c-brand-1);
    background: var(--vp-c-bg-alt);
  }
}

.DocSearch-Button .DocSearch-Button-Container {
  display: flex;
  align-items: center;
}

.DocSearch-Button .DocSearch-Search-Icon {
  position: relative;
  width: 16px;
  height: 16px;
  color: var(--vp-c-text-1);
  fill: currentColor;
  transition: color 0.5s;
}

.DocSearch-Button:hover .DocSearch-Search-Icon {
  color: var(--vp-c-text-1);
}

@media (min-width: 768px) {
  .DocSearch-Button .DocSearch-Search-Icon {
    top: 1px;
    margin-right: 8px;
    width: 14px;
    height: 14px;
    color: var(--vp-c-text-2);
  }
}

.DocSearch-Button .DocSearch-Button-Placeholder {
  display: none;
  margin-top: 2px;
  padding: 0 16px 0 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--vp-c-text-2);
  transition: color 0.5s;
}

.DocSearch-Button:hover .DocSearch-Button-Placeholder {
  color: var(--vp-c-text-1);
}

@media (min-width: 768px) {
  .DocSearch-Button .DocSearch-Button-Placeholder {
    display: inline-block;
  }
}

.DocSearch-Button .DocSearch-Button-Keys {
  /*rtl:ignore*/
  direction: ltr;
  display: none;
  min-width: auto;
}

@media (min-width: 768px) {
  .DocSearch-Button .DocSearch-Button-Keys {
    display: flex;
    align-items: center;
  }
}

.DocSearch-Button .DocSearch-Button-Key {
  display: block;
  border: 1px solid var(--vp-c-divider);
  /*rtl:begin:ignore*/
  border-right: none;
  border-radius: 4px 0 0 4px;
  padding: 0 1px;
  /*rtl:end:ignore*/
  min-width: 0;
  width: auto;
  height: 22px;
  line-height: 22px;
  font-family: var(--vp-font-family-base);
  font-size: 12px;
  font-weight: 500;
  transition: color 0.5s, border-color 0.5s;
}

.DocSearch-Button .DocSearch-Button-Key + .DocSearch-Button-Key {
  /*rtl:begin:ignore*/
  border-right: 1px solid var(--vp-c-divider);
  border-left: none;
  border-radius: 0 4px 4px 0;
  color: var(--docsearch-muted-color);
  /*rtl:end:ignore*/
}

.DocSearch-Button-Key svg {
    color: var(--docsearch-muted-color);
}

.DocSearch-Button .DocSearch-Button-Key:first-child {
  font-size: 0 !important;
}


.DocSearch-Commands-Key {
  color: var(--vp-c-text-2);
  padding: 4px;
  border-radius: 4px;
  line-height: 19px;
  border: 1px solid var(--vp-c-divider);
}



.DocSearch-Search-Icon {
  --icon: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' stroke-width='1.6' viewBox='0 0 20 20'%3E%3Cpath fill='none' stroke='currentColor' stroke-linecap='round' stroke-linejoin='round' d='m14.386 14.386 4.088 4.088-4.088-4.088A7.533 7.533 0 1 1 3.733 3.733a7.533 7.533 0 0 1 10.653 10.653z'/%3E%3C/svg%3E");
}
</style>
