<template>
  <div class="VPTeamPage">
    <slot />
  </div>
</template>

<style scoped>
.VPTeamPage {
  padding-block-end: 96px;
}

@media (min-width: 768px) {
  .VPTeamPage {
    padding-block-end: 128px;
  }
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
