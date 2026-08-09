<template>
  <div class="VPTeamPage">
    <slot />
  </div>
</template>

<style scoped>
.VPTeamPage {
  margin: 6rem 0;
}

@media (min-width: 48rem) {
  .VPTeamPage {
    margin: 8rem 0;
  }
}

.VPHome :slotted(.VPTeamPageTitle) {
  border-top: 1px solid var(--vp-c-gutter);
  padding-top: 5.5rem !important;
}

:slotted(.VPTeamPageSection + .VPTeamPageSection),
:slotted(.VPTeamMembers + .VPTeamPageSection) {
  margin-top: 4rem;
}

:slotted(.VPTeamMembers + .VPTeamMembers) {
  margin-top: 1.5rem;
}

@media (min-width: 48rem) {
  :slotted(.VPTeamPageTitle + .VPTeamPageSection) {
    margin-top: 1rem;
  }

  :slotted(.VPTeamPageSection + .VPTeamPageSection),
  :slotted(.VPTeamMembers + .VPTeamPageSection) {
    margin-top: 6rem;
  }
}

:slotted(.VPTeamMembers) {
  padding: 0 1.5rem;
}

@media (min-width: 48rem) {
  :slotted(.VPTeamMembers) {
    padding: 0 3rem;
  }
}

@media (min-width: 60rem) {
  :slotted(.VPTeamMembers) {
    padding: 0 4rem;
  }
}
</style>
