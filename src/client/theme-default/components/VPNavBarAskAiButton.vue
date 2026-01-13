<template>
  <button type="button" aria-label="Ask AI" class="DocSearch DocSearch-Button VPNavBarAskAiButton">
    <span class="DocSearch-Button-Container">
      <span class="vpi-sparkles DocSearch-Search-Icon"></span>
    </span>
  </button>
</template>

<style>
/* Sidepanel CSS variable mappings (mirrors VPNavBarSearchButton.vue pattern) */
[class*='DocSearch'] {
  --docsearch-sidepanel-background: var(--docsearch-modal-background);
  --docsearch-sidepanel-background-dark: var(--docsearch-searchbox-background);
  --docsearch-sidepanel-white: var(--vp-c-bg);
  --docsearch-sidepanel-primary: var(--docsearch-primary-color);
  --docsearch-sidepanel-primary-dark: var(--vp-c-brand-2);
  --docsearch-sidepanel-primary-disabled: var(--vp-c-brand-soft);
  --docsearch-sidepanel-accent: var(--docsearch-highlight-color);
  --docsearch-sidepanel-accent-muted: var(--vp-c-brand-soft);
  --docsearch-sidepanel-border: var(--docsearch-subtle-color);
  --docsearch-sidepanel-text-base: var(--docsearch-text-color);
  --docsearch-sidepanel-text-muted: var(--docsearch-secondary-text-color);
  --docsearch-sidepanel-scrollbar-color: var(--docsearch-muted-color);
  --docsearch-sidepanel-scrollbar-bg: var(--docsearch-modal-background);
  --docsearch-sidepanel-hit-background: var(--docsearch-hit-background);
  --docsearch-sidepanel-hit-color: var(--docsearch-hit-color);
  --docsearch-sidepanel-hit-highlight-color: var(--docsearch-hit-highlight-color);
}

.VPNavBarAskAiButton .DocSearch-Button-Keys:after {
  /*rtl:ignore*/
  direction: ltr;
  content: 'Ctrl I';
}

.mac .VPNavBarAskAiButton .DocSearch-Button-Keys:after {
  content: '\2318  I';
}


.DocSearch-Sidepanel-Container.inline.side-right {
  border-bottom-left-radius: 0;
  border-top-left-radius: 0;
}


/* Hide sidepanel-js's default button - we provide our own */
.DocSearch-SidepanelButton {
  display: none !important;
}

.VPNavBarAskAiButton {
  transition: all 0.25s;
}


.VPNavBarAskAiButton:hover {
  background: var(--docsearch-primary-color);
}

.VPNavBarAskAiButton:hover .DocSearch-Search-Icon {
  background-color: var(--vp-c-white);
}
</style>
