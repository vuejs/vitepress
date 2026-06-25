<template>
  <div class="VPTeamPage">
    <slot />
  </div>
</template>

<style scoped>
.VPTeamPage {
  margin: 96px 0;
}

@media (min-width: 768px) {
  .VPTeamPage {
    margin: 128px 0;
  }
}

.VPHome :slotted(.VPTeamPageTitle) {
  border-block-start: 1px solid var(--vp-c-gutter);
  padding-block-start: 88px !important;
}

:slotted(.VPTeamPageSection + .VPTeamPageSection),
:slotted(.VPTeamMembers + .VPTeamPageSection) {
  margin-block-start: 64px;
}

:slotted(.VPTeamMembers + .VPTeamMembers) {
  margin-block-start: 24px;
}

@media (min-width: 768px) {
  :slotted(.VPTeamPageTitle + .VPTeamPageSection) {
    margin-block-start: 16px;
  }

  :slotted(.VPTeamPageSection + .VPTeamPageSection),
  :slotted(.VPTeamMembers + .VPTeamPageSection) {
    margin-block-start: 96px;
  }
}

:slotted(.VPTeamMembers) {
  padding: 0 24px;
}

@media (min-width: 768px) {
  :slotted(.VPTeamMembers) {
    padding: 0 48px;
  }
}

@media (min-width: 960px) {
  :slotted(.VPTeamMembers) {
    padding: 0 64px;
  }
}
</style>
