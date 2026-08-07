<template>
  <div class="vp-doc container">
    <slot />
  </div>
</template>

<style scoped>
.container {
  margin: auto;
  width: 100%;
  max-width: 1280px;
  padding: 0 24px;
}

@media (min-width: 640px) {
  .container {
    padding: 0 48px;
  }
}

@media (min-width: 960px) {
  .container {
    width: 100%;
    padding: 0 64px;
  }
}

.vp-doc :deep(.VPHomeSponsors),
.vp-doc :deep(.VPTeamPage) {
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
