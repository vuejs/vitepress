<template>
  <div class="VPTeamPage">
    <slot />
  </div>
</template>

<style scoped>
.VPTeamPage {
  padding: 48px 24px 128px;
}

@media (min-width: 768px) {
  .VPTeamPage {
    padding: 64px 32px 128px;
  }
}

@media (min-width: 960px) {
  .VPTeamPage {
    padding: 96px 64px 128px;
  }
}

.VPTeamPage :deep(.VPTeamPageSection + .VPTeamPageSection),
.VPTeamPage :deep(.VPTeamMembers + .VPTeamPageSection) {
  margin-top: 64px;
}

.VPTeamPage :deep(.VPTeamPageTitle + .VPTeamMembers) {
  margin-top: 32px;
}

.VPTeamPage :deep(.VPTeamMembers + .VPTeamMembers) {
  margin-top: 24px;
}

@media (min-width: 768px) {
  .VPTeamPage :deep(.VPTeamPageTitle + .VPTeamPageSection) {
    margin-top: 16px;
  }

  .VPTeamPage :deep(.VPTeamPageSection + .VPTeamPageSection),
  .VPTeamPage :deep(.VPTeamMembers + .VPTeamPageSection) {
    margin-top: 96px;
  }
}
</style>
