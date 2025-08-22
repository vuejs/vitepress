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
    class="vp-nav-bar-search-button"
    :aria-label="translate('button.buttonAriaLabel')"
    aria-keyshortcuts="/ control+k meta+k"
  >
    <!-- <span class="vp-nav-bar-search-button__container"> -->
      <span class="vp-nav-bar-search-button__icon vpi-search"></span>
      <span class="DocSearch-Button-Placeholder">{{ translate('button.buttonText') }}</span>
    <!-- </span> -->
    <!-- <span class="DocSearch-Button-Keys">
      <kbd class="DocSearch-Button-Key"></kbd>
      <kbd class="DocSearch-Button-Key"></kbd>
    </span> -->
  </button>
</template>

<style>
.vp-nav-bar-search-button {
  --docsearch-muted-color: var(--docsearch-text-color);
  --docsearch-searchbox-background: transparent;

  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: var(--vp-nav-height);
}

.vp-nav-bar-search-button__icon {
  width: 20px;
  height: 20px;
  color: var(--vp-c-text-1);
}

/**
 * Styles for loaded Algolia components. Algolia uses `DocSearch` as a
 * class name to their elements, such as `DocSearch-Button`.
 */
[class*='DocSearch'] {
  --docsearch-actions-height: auto;
  --docsearch-actions-width: auto;
  --docsearch-background-color: var(--vp-c-bg-soft);
  --docsearch-container-background: var(--vp-backdrop-bg-color);
  --docsearch-focus-color: var(--vp-c-brand-1);
  --docsearch-footer-background: var(--vp-c-bg-1);
  --docsearch-highlight-color: var(--vp-c-brand-1);
  --docsearch-hit-background: var(--vp-c-default-soft);
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

.dark [class*='DocSearch-button'] {
  --docsearch-modal-shadow: none;
}

.DocSearch-Button {
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  border-radius: 6px;
  padding: 0;
  width: 40px;
  height: var(--vp-nav-height);
  background-color: transparent;
  color: var(--vp-c-text-1);
}

.DocSearch-Search-Icon {
  width: 20px;
  height: 20px;
  color: inherit !important;
}

@media (min-width: 768px) {
  .DocSearch-Button {
    /* --docsearch-muted-color: var(--docsearch-secondary-text-color);
    --docsearch-searchbox-background: var(--vp-c-bg-alt); */
  }

  .DocSearch-Search-Icon {
    width: 15px;
    height: 15px;
  }

  .DocSearch-Button-Placeholder {
    /* font-size: 13px; */
  }
}

.DocSearch-Button-Keys {
  min-width: auto;
  margin: 0;
  padding: 4px 6px;
  background-color: var(--docsearch-key-background);
  border: 1px solid var(--docsearch-subtle-color);
  border-radius: 4px;
  font-size: 12px;
  line-height: 1;
  color: var(--docsearch-key-color);
}

.DocSearch-Button-Keys > * {
  display: none;
}

.DocSearch-Button-Keys:after {
  /*rtl:ignore*/
  direction: ltr;
  content: 'Ctrl K';
}

.mac .DocSearch-Button-Keys:after {
  content: '\2318  K';
}

.DocSearch-Clear {
  padding: 0 8px;
}

.DocSearch-Commands-Key {
  border: 1px solid var(--docsearch-subtle-color);
  border-radius: 4px;
  padding: 4px;
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
</style>
