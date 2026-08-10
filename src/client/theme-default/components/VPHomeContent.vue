<template>
  <div class="VPHomeContent vp-doc container">
    <slot />
  </div>
</template>

<style scoped>
.container {
  margin: auto;
  width: 100%;
  max-width: 80rem;
  padding: 0 1.5rem;
}

@media (min-width: 40rem) {
  .container {
    padding: 0 3rem;
  }
}

@media (min-width: 60rem) {
  .container {
    width: 100%;
    padding: 0 4rem;
  }
}

/* stretch to full viewport width, overflow is clipped by .VPHome */
.vp-doc :deep(.VPHomeSponsors),
.vp-doc :deep(.VPTeamPage) {
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
}

.vp-doc :deep(.VPTeamPage a) {
  text-decoration: none;
}
</style>
