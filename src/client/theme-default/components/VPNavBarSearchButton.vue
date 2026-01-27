<script lang="ts" setup>
import type { ButtonTranslations } from '../../../../types/local-search'
import { createSearchTranslate } from '../support/translation'

// button translations
const defaultTranslations: { button: ButtonTranslations } = {
  button: {
    buttonText: 'Search',
    buttonAriaLabel: 'Search'
  }
}

const translate = createSearchTranslate(defaultTranslations)
</script>

<template>
  <button
    type="button"
    :aria-label="translate('button.buttonAriaLabel')"
    aria-keyshortcuts="/ control+k meta+k"
    class="DocSearch VPDocSearch-Button VPNavBarSearchButton"
  >
    <span class="VPDocSearch-Button-Container">
      <span class="vpi-search DocSearch-Search-Icon"></span>
      <span class="VPDocSearch-Button-Placeholder">
        {{ translate('button.buttonText') }}
      </span>
    </span>
    <span class="VPDocSearch-Button-Keys" />
  </button>
</template>

<style>
[class*='DocSearch'] {
  --docsearch-actions-height: auto;
  --docsearch-actions-width: auto;
  --docsearch-background-color: var(--vp-c-bg-soft);
  --docsearch-container-background: var(--vp-backdrop-bg-color);
  --docsearch-focus-color: var(--vp-c-brand-1);
  --docsearch-footer-background: var(--vp-c-bg);
  --docsearch-highlight-color: var(--vp-c-brand-1);
  --docsearch-hit-background: var(--vp-c-bg);
  --docsearch-hit-color: var(--vp-c-text-1);
  --docsearch-hit-highlight-color: var(--vp-c-brand-soft);
  --docsearch-icon-color: var(--vp-c-text-2);
  --docsearch-key-background: transparent;
  --docsearch-key-color: var(--vp-c-text-2);
  --docsearch-modal-background: var(--vp-c-bg-soft);
  --docsearch-muted-color: var(--vp-c-text-2);
  --docsearch-primary-color: var(--vp-c-brand-1);
  --docsearch-searchbox-focus-background: transparent;
  --docsearch-secondary-text-color: var(--vp-c-text-2);
  --docsearch-soft-primary-color: var(--vp-c-brand-soft);
  --docsearch-subtle-color: var(--vp-c-divider);
  --docsearch-success-color: var(--vp-c-brand-soft);
  --docsearch-text-color: var(--vp-c-text-1);
}

.dark [class*='DocSearch'] {
  --docsearch-modal-shadow: none;
}

.DocSearch-Clear {
  padding: 0 8px;
}

.DocSearch-Commands-Key {
  padding: 4px;
  border: 1px solid var(--docsearch-subtle-color);
  border-radius: 4px;
}

.DocSearch-Hit a:focus-visible {
  outline: 2px solid var(--docsearch-focus-color);
}

.DocSearch-Logo [class^='cls-'] {
  fill: currentColor;
}

.DocSearch-SearchBar + .DocSearch-Footer {
  border-top-color: transparent;
}

.DocSearch-Title {
  font-size: revert;
  line-height: revert;
}

.VPDocSearch-Button {
  --docsearch-muted-color: var(--docsearch-text-color);
  --docsearch-searchbox-background: transparent;
  padding: 4px 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 36px;
  width: auto;
  border: none;
  border-radius: 8px;
}

.VPDocSearch-Button-Container {
  display: inline-flex;
  height: 100%;
  gap: 6px;
  align-items: center;
}

.DocSearch-Search-Icon {
  color: inherit !important;
  width: 20px;
  height: 20px;
}

.VPDocSearch-Button-Keys {
  min-width: auto;
  margin: 0;
  padding: 4px 6px;
  background-color: var(--docsearch-key-background);
  border: 1px solid var(--docsearch-subtle-color);
  border-radius: 4px;
  font-size: 12px;
  line-height: 1;
  color: var(--docsearch-key-color);
  display: none;
}

.VPDocSearch-Button-Placeholder {
  display: none;
}

.VPDocSearch-Button-Keys > * {
  display: none;
}

.VPDocSearch-Button-Keys:after {
  /*rtl:ignore*/
  direction: ltr;
  content: 'Ctrl K';
}

.mac .VPDocSearch-Button-Keys:after {
  content: '\2318  K';
}

@media (min-width: 768px) {
  .VPDocSearch-Button {
    background-color: var(--vp-c-bg-alt);
    color: var(--docsearch-secondary-text-color);
  }

  .DocSearch-Search-Icon {
    width: 15px;
    height: 15px;
  }

  .VPDocSearch-Button-Placeholder {
    font-size: 13px;
    display: block;
  }

  .VPDocSearch-Button-Keys {
    display: block;
  }
}
</style>
