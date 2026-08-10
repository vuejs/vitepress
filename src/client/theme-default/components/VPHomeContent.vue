<template>
  <div class="vp-doc container">
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

.vp-doc :deep(.VPHomeSponsors),
.vp-doc :deep(.VPTeamPageTitle),
.vp-doc :deep(.VPTeamPageSection) {
  padding-left: 0;
  padding-right: 0;
}

.vp-doc :deep(.VPHomeSponsors h2) {
  border-top: none;
  letter-spacing: normal;
}

.vp-doc :deep(.VPHomeSponsors a),
.vp-doc :deep(.VPTeamPage a) {
  text-decoration: none;
}
</style>
